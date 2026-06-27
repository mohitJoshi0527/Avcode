import os
import requests
import fitz  # PyMuPDF
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_core.documents import Document
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

from database import get_vector_collection

load_dotenv()

# We need GOOGLE_API_KEY set in the environment
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)

vector_collection = get_vector_collection()

# Initialize MongoDB Atlas Vector Search
vector_store = MongoDBAtlasVectorSearch(
    collection=vector_collection,
    embedding=embeddings,
    index_name="vector_index" # Ensure this index is created in Atlas UI
)

def process_pdf_url(url: str, course_id: str):
    # 1. Download PDF
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to download PDF from {url}")
    
    # 2. Extract text using PyMuPDF
    pdf_document = fitz.open(stream=response.content, filetype="pdf")
    text = ""
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        text += page.get_text()
        
    # 3. Chunk text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_text(text)
    
    # 4. Create Document objects with metadata
    docs = [
        Document(page_content=chunk, metadata={"course_id": course_id})
        for chunk in chunks
    ]
    
    # 5. Add to vector store
    vector_store.add_documents(docs)
    
    return len(docs)

def generate_chat_response(query: str, course_id: str):
    # Configure retriever to only fetch documents for this specific course
    retriever = vector_store.as_retriever(
        search_kwargs={
            "k": 6,  # Retrieve top 6 most relevant chunks
            "pre_filter": {"course_id": {"$eq": course_id}}
        }
    )
    
    # Fetch relevant chunks
    docs = retriever.invoke(query)
    context = "\n\n".join([doc.page_content for doc in docs])
    
    # Elite System Prompt for Agentic Behavior
    system_instruction = """You are an elite, highly intelligent AI Study Buddy designed to help university students master their coursework.
You have access to the exact course materials through the retrieved document chunks below.

YOUR CORE DIRECTIVES:
1. GROUNDING: STRICTLY base your answers on the provided context. If the answer is not in the context, explicitly state: "I cannot find the exact answer in your course materials." You may then provide a brief general answer if helpful, but heavily emphasize that it is not from the course notes.
2. QUIZZES & FLASHCARDS: If the student asks for a quiz, a test, or flashcards, you must generate a highly structured, challenging, and educational multiple-choice quiz based ONLY on the retrieved context. Format the quiz beautifully in Markdown, providing the correct answers and explanations at the very end.
3. FORMATTING: Keep explanations crystal clear. Use Markdown extensively—bullet points, bold text for key terms, and code blocks if applicable.
4. TONE: Be encouraging, academic, yet accessible. Act as a mentor.
5. BOUNDARIES: NEVER answer off-topic questions (e.g., recipes, personal advice, coding questions unrelated to the course). Politely redirect the student back to their studies.

COURSE MATERIAL CONTEXT:
{context}
"""

    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(system_instruction),
        HumanMessagePromptTemplate.from_template("{query}")
    ])
    
    # Modern LCEL (LangChain Expression Language) syntax
    chain = prompt | llm
    
    response = chain.invoke({"context": context, "query": query})
    return response.content
