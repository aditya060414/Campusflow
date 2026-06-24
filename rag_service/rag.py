import datetime
import logging
import uuid
from typing import Dict, List, Tuple

import chromadb
from sentence_transformers import SentenceTransformer

from langchain_text_splitters import RecursiveCharacterTextSplitter

# Configure logging
logger = logging.getLogger("campusflow_rag")

# =====================================================================
# GLOBAL INITIALIZATION
# =====================================================================

logger.info("Initializing SentenceTransformer model 'all-MiniLM-L6-v2' globally...")
# Initialize embedding model once globally to avoid reloading per request
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
logger.info("SentenceTransformer model initialized successfully.")

logger.info("Initializing in-memory ChromaDB client...")
# Initialize ChromaDB client in-memory (no persistence)
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection("campus_notes")
logger.info("ChromaDB collection 'campus_notes' is ready.")

# Initialize the text splitter as per chunking strategy: chunk_size=500, chunk_overlap=100
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100
)

# In-memory session-based chat history: dict[student_id, list[dict]]
chat_histories: Dict[str, List[Dict[str, str]]] = {}


# =====================================================================
# CORE RAG FUNCTIONS
# =====================================================================

def ingest_notes(student_id: str, subject: str, notes_text: str) -> int:
    """
    Splits the notes, creates embeddings, deletes previous notes for the
    same student + subject, and inserts the new chunks.
    """
    if not notes_text.strip():
        raise ValueError("Notes content cannot be empty.")

    # 1. Split notes into chunks
    chunks = text_splitter.split_text(notes_text)
    if not chunks:
        return 0

    # 2. Create embeddings for all chunks in a batch
    embeddings = embedding_model.encode(chunks).tolist()

    # 3. Delete previous notes for the same student and subject
    # This ensures no duplicate notes exist when students re-upload
    try:
        collection.delete(
            where={
                "$and": [
                    {"student_id": {"$eq": student_id}},
                    {"subject": {"$eq": subject}}
                ]
            }
        )
        logger.info(f"Deleted existing notes for student {student_id}, subject {subject}.")
    except Exception as e:
        logger.warning(f"Error while deleting existing notes (might be empty): {str(e)}")

    # 4. Prepare metadata and IDs
    uploaded_at = datetime.date.today().isoformat()
    ids = [str(uuid.uuid4()) for _ in range(len(chunks))]
    metadatas = [
        {
            "student_id": student_id,
            "subject": subject,
            "uploaded_at": uploaded_at,
            "source": "lecture_notes"
        }
        for _ in range(len(chunks))
    ]

    # 5. Insert new chunks into ChromaDB
    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas
    )
    logger.info(f"Successfully stored {len(chunks)} chunks for student {student_id}, subject {subject}.")
    return len(chunks)


def retrieve_relevant_context(student_id: str, query: str, subject: str = None, top_k: int = 8) -> Tuple[str, int]:
    """
    Performs semantic retrieval to find the most relevant chunks for a student.
    Can optionally filter by subject if provided.
    Returns a tuple of (concatenated_context, number_of_chunks_retrieved).
    """
    if not query.strip():
        return "", 0

    # 1. Generate query embedding
    query_embedding = embedding_model.encode(query).tolist()

    # 2. Build metadata filter
    if subject:
        where_filter = {
            "$and": [
                {"student_id": {"$eq": student_id}},
                {"subject": {"$eq": subject}}
            ]
        }
    else:
        where_filter = {"student_id": {"$eq": student_id}}

    # 3. Query collection
    try:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_filter
        )
    except Exception as e:
        logger.error(f"Error querying ChromaDB: {str(e)}")
        return "", 0

    # 4. Extract and concatenate context chunks
    documents = results.get("documents", [[]])[0]
    if not documents:
        return "", 0

    # Concatenate context with clear spacing
    context = "\n\n".join(documents)
    
    # Enforce context length safety limit (approx. 6000 characters)
    if len(context) > 6000:
        context = context[:6000] + "\n... [Truncated for Context Limit] ..."

    return context, len(documents)


def get_all_subject_notes(student_id: str, subject: str) -> str:
    """
    Retrieves all stored notes/chunks for a specific student and subject.
    Used to gather complete context for Flashcard and MCQ generation.
    """
    try:
        results = collection.get(
            where={
                "$and": [
                    {"student_id": {"$eq": student_id}},
                    {"subject": {"$eq": subject}}
                ]
            }
        )
    except Exception as e:
        logger.error(f"Error fetching notes from ChromaDB: {str(e)}")
        return ""

    documents = results.get("documents", [])
    if not documents:
        return ""

    # Concatenate all notes
    return "\n\n".join(documents)


# =====================================================================
# CONVERSATION MEMORY FOR CHAT
# =====================================================================

def get_chat_history(student_id: str) -> List[Dict[str, str]]:
    """
    Retrieve the chat history list for the current student.
    """
    if student_id not in chat_histories:
        chat_histories[student_id] = []
    return chat_histories[student_id]


def add_chat_message(student_id: str, role: str, content: str):
    """
    Add a message to the student's in-memory chat history.
    Limits history to the last 20 messages to keep LLM context clean.
    """
    history = get_chat_history(student_id)
    history.append({"role": role, "content": content})
    if len(history) > 20:
        chat_histories[student_id] = history[-20:]
