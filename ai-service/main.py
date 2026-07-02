from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from rag import process_pdf_url, process_code_url, generate_chat_response
from agent import run_campus_agent

load_dotenv()

app = FastAPI(title="Agentic Study Buddy Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    course_id: str
    query: str

class IngestRequest(BaseModel):
    course_id: str
    pdf_url: str

class IngestCodeRequest(BaseModel):
    course_id: str
    code_url: str

class AgentChatRequest(BaseModel):
    student_id: str   # injected by Node.js from the Passport session — never from the user
    query: str

@app.get("/")
def read_root():
    return {"message": "Agentic Study Buddy API is running"}

@app.post("/ingest")
async def ingest_document(req: IngestRequest):
    try:
        chunks_added = process_pdf_url(req.pdf_url, req.course_id)
        return {"status": "success", "message": f"Added {chunks_added} chunks to vector store for course {req.course_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_agent(req: ChatRequest):
    try:
        answer = generate_chat_response(req.query, req.course_id)
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest-code")
async def ingest_code(req: IngestCodeRequest):
    try:
        chunks_added = process_code_url(req.code_url, req.course_id)
        return {"status": "success", "message": f"Added {chunks_added} code chunks to vector store for course {req.course_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/campus-agent/chat")
async def campus_agent_chat(req: AgentChatRequest):
    """
    Smart Campus Assistant — Agentic AI endpoint.
    `student_id` MUST be injected by the Node.js auth middleware;
    it should never come from the browser/user directly.
    """
    try:
        answer = run_campus_agent(req.student_id, req.query)
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
