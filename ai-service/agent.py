"""
Smart Campus Assistant — Agentic AI with Tool Use (Function Calling)

Architecture:
  - Three READ-ONLY PyMongo tools scoped to the authenticated student
  - LangChain tool-calling agent backed by Gemini-2.5-flash
  - student_id is ALWAYS injected server-side (from Node.js Passport session),
    never taken from the LLM or user message — this prevents prompt-injection
    attacks that try to read another student's data.
"""

from __future__ import annotations
import os
from typing import Any
from bson import ObjectId
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from database import client  # reuse the existing MongoClient from database.py

load_dotenv()

# ─────────────────────────────────────────────
# Database handle
# ─────────────────────────────────────────────
db = client.get_database("avcode")
users_col     = db.get_collection("users")
courses_col   = db.get_collection("courses")


# ─────────────────────────────────────────────
# Helper: safe course projection (no S3 keys, no internals)
# ─────────────────────────────────────────────
SAFE_COURSE_PROJECTION = {
    "_id": 1,
    "title": 1,
    "description": 1,
    "tags": 1,
    "content.rating": 1,
}

SAFE_INSTRUCTOR_PROJECTION = {
    "name": 1,
    "email": 1,
}


# ─────────────────────────────────────────────
# ──  TOOL 1: Get the student's enrolled courses
# ─────────────────────────────────────────────
def _get_enrolled_courses(student_id: str) -> list[dict]:
    """
    Fetches only the courses the authenticated student is enrolled in.
    Returns safe metadata only — no S3 keys, no other users' data.
    """
    oid = ObjectId(student_id)
    user = users_col.find_one(
        {"_id": oid},
        {"enrolledCourses": 1, "_id": 0}
    )
    if not user or not user.get("enrolledCourses"):
        return []

    enrolled_ids = user["enrolledCourses"]
    courses = list(courses_col.find(
        {"_id": {"$in": enrolled_ids}},
        SAFE_COURSE_PROJECTION
    ))

    # Convert ObjectIds to strings for JSON serialisation
    for c in courses:
        c["id"] = str(c.pop("_id"))
    return courses


# ─────────────────────────────────────────────
# ──  TOOL 2: Get details of a specific course
# ─────────────────────────────────────────────
def _get_course_details(student_id: str, course_title: str) -> dict | None:
    """
    Returns safe course metadata for a course the student IS enrolled in.
    Guards against looking up courses the student has no access to.
    """
    oid = ObjectId(student_id)
    user = users_col.find_one({"_id": oid}, {"enrolledCourses": 1, "_id": 0})
    if not user:
        return {"error": "Student not found."}

    enrolled_ids = user.get("enrolledCourses", [])

    course = courses_col.find_one(
        {
            "title": {"$regex": course_title, "$options": "i"},
            "_id": {"$in": enrolled_ids},    # ← SECURITY: only enrolled courses
        },
        SAFE_COURSE_PROJECTION
    )
    if not course:
        return {"error": f"No enrolled course matching '{course_title}' found."}

    course["id"] = str(course.pop("_id"))
    return course


# ─────────────────────────────────────────────
# ──  TOOL 3: Get instructor info for a course
# ─────────────────────────────────────────────
def _get_instructor_info(student_id: str, course_title: str) -> dict | None:
    """
    Returns ONLY the instructor's name and email for a course the
    authenticated student is enrolled in. No passwords, no roles, no other users.
    """
    oid = ObjectId(student_id)
    user = users_col.find_one({"_id": oid}, {"enrolledCourses": 1, "_id": 0})
    if not user:
        return {"error": "Student not found."}

    enrolled_ids = user.get("enrolledCourses", [])

    # Pipeline: match enrolled course → lookup instructor → project safe fields
    pipeline = [
        {
            "$match": {
                "title": {"$regex": course_title, "$options": "i"},
                "_id": {"$in": enrolled_ids},
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "createdBy",
                "foreignField": "_id",
                "as": "instructor",
                "pipeline": [{"$project": SAFE_INSTRUCTOR_PROJECTION}],
            }
        },
        {"$unwind": "$instructor"},
        {
            "$project": {
                "_id": 0,
                "courseTitle": "$title",
                "instructorName": "$instructor.name",
                "instructorEmail": "$instructor.email",
            }
        },
    ]
    results = list(courses_col.aggregate(pipeline))
    if not results:
        return {"error": f"No enrolled course matching '{course_title}' found."}
    return results[0]


# ─────────────────────────────────────────────
# LLM initialisation
# ─────────────────────────────────────────────
_llm_base = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)


# ─────────────────────────────────────────────
# System prompt for the campus agent
# ─────────────────────────────────────────────
CAMPUS_AGENT_SYSTEM_PROMPT = """\
You are the Smart Campus Assistant — a helpful, friendly AI that helps university \
students with questions about their courses, instructors, and academic life.

You have access to three tools that look up LIVE data from the university database:
1. get_enrolled_courses — lists all courses the student is currently enrolled in.
2. get_course_details   — fetches the description, topics (tags), and rating for a specific course.
3. get_instructor_info  — fetches the instructor's name and email for a specific course.

RULES:
- Only answer questions related to the student's academic life and their own courses.
- NEVER reveal raw database IDs or internal fields.
- If a student asks about another student's data, politely refuse.
- When you use a tool, always wait for its result before composing your final answer.
- Be warm, encouraging, and concise.
"""


# ─────────────────────────────────────────────
# Agent entry-point — called by main.py
# ─────────────────────────────────────────────
def run_campus_agent(student_id: str, query: str) -> str:
    """
    Runs the Gemini function-calling agent loop.
    `student_id` is ALWAYS supplied by the server (from the authenticated session),
    never derived from the user's message.
    """

    # ── Build LangChain @tool wrappers that capture student_id in their closure
    @tool
    def get_enrolled_courses() -> list[dict]:
        """
        Returns a list of courses the current student is enrolled in,
        including the course title, description, tags, and rating.
        Call this when the student asks what courses they are taking.
        """
        return _get_enrolled_courses(student_id)

    @tool
    def get_course_details(course_title: str) -> dict:
        """
        Returns detailed information (description, topics/tags, rating) for a
        specific course the student is enrolled in.
        Use this when the student asks about the content or topics of a course.

        Args:
            course_title: The name (or partial name) of the course to look up.
        """
        return _get_course_details(student_id, course_title)

    @tool
    def get_instructor_info(course_title: str) -> dict:
        """
        Returns the instructor's name and contact email for a specific course
        the student is enrolled in.
        Use this when the student asks who teaches a course or needs the
        professor's email.

        Args:
            course_title: The name (or partial name) of the course.
        """
        return _get_instructor_info(student_id, course_title)

    tools = [get_enrolled_courses, get_course_details, get_instructor_info]
    llm_with_tools = _llm_base.bind_tools(tools)
    tool_map = {t.name: t for t in tools}

    # ── Message history — the agent loop
    messages: list[Any] = [
        SystemMessage(content=CAMPUS_AGENT_SYSTEM_PROMPT),
        HumanMessage(content=query),
    ]

    # ── Agentic loop: keep going until the LLM stops calling tools
    MAX_ITERATIONS = 6  # safety cap to avoid infinite loops
    for _ in range(MAX_ITERATIONS):
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        if not response.tool_calls:
            # LLM has finished — extract the plain-text content
            content = response.content
            # Gemini may return a list of content blocks (text + signature)
            if isinstance(content, list):
                text_parts = [
                    block["text"] for block in content
                    if isinstance(block, dict) and block.get("type") == "text"
                ]
                return "\n".join(text_parts)
            return content

        # Execute each tool the LLM requested
        for tc in response.tool_calls:
            tool_name = tc["name"]
            tool_args = tc["args"]
            tool_id   = tc["id"]

            if tool_name not in tool_map:
                result = {"error": f"Unknown tool: {tool_name}"}
            else:
                try:
                    result = tool_map[tool_name].invoke(tool_args)
                except Exception as e:
                    result = {"error": str(e)}

            messages.append(
                ToolMessage(content=str(result), tool_call_id=tool_id)
            )

    return "I'm sorry, I couldn't complete your request in time. Please try again."
