# CampusFlow — FastAPI RAG Microservice (AI Engine)

The FastAPI service is the core **Artificial Intelligence Engine** of CampusFlow. It coordinates semantic vector searches, note ingestion, text extraction (including PDF page parsing and optical character recognition on image notes), and LLM completions via Groq (Llama-3.1-8b-instant) using highly structured JSON prompt templates.

---

## ⚙️ Core AI & RAG Pipeline

The microservice processes academic notes and queries through the following automated workflows:

### 1. Multi-Format Knowledge Ingestion
* **Plain Text:** Ingests notes directly and chunks them semantically.
* **PDF Ingestion:** Uses `pypdf` to parse documents page-by-page and compile their textual contents.
* **Image Ingestion (OCR):** Employs `easyocr` to run optical character recognition on uploaded images (PNG, JPG, JPEG), extracting handwritten or printed text blocks.

### 2. Semantic Chunking & Vectorization
* **Text Partitioning:** Uses LangChain's `RecursiveCharacterTextSplitter` configured with a chunk size of `500` characters and an overlap of `100` characters to maintain context boundaries.
* **Text Embedding:** Uses the sentence-transformers model `all-MiniLM-L6-v2` (running locally on CPU) to convert text chunks into 384-dimensional dense semantic vectors.
* **Vector Storage:** Indexes the embeddings and source metadata in an in-memory `ChromaDB` collection.

### 3. Semantic Retrieval & LLM completion
* **Context Harvesting:** When a student asks a question, the engine embed-queries ChromaDB, retrieving the top `8` most relevant context chunks.
* **System Prompt Constraints:** Instructs the LLM to classify answers strictly as `notes` (notes-based), `hybrid` (partially from notes + expanded), or `general` (not found in notes but helpful general knowledge).
* **Low-Latency Completer:** Communicates with the Groq API utilizing `llama-3.1-8b-instant` to generate responses in strict JSON format.

---

## 📁 File Directory

```text
rag_service/
├── main.py             # FastAPI web routers & Pydantic request/response models
├── rag.py              # In-memory ChromaDB client, SentenceTransformer embedder, & retrieve/ingest logic
├── prompts.py          # Groq system prompts and strict JSON completion templates
├── utils.py            # HTTP client for Groq completions with clean JSON parsing
├── models.py           # Pydantic schema validation layers
└── requirements.txt    # Python library dependency manifests
```

---

## 🔌 Core Microservice REST Endpoints

All endpoints are hosted on port `8001` and receive/respond with structured JSON payloads:

* `POST /ingest`: Ingests and vectorizes plain text notes.
* `POST /upload-note`: Ingests PDF, TXT, or Image files, performs OCR/parsing, runs topic extraction, and vectorizes.
* `POST /ask`: Performs semantic retrieval and returns a structured answer with cited context chunks.
* `POST /flashcards`: Generates exactly 10 flashcards, each rated with an AI difficulty (`easy`, `medium`, `hard`).
* `POST /quiz`: Generates 10 multiple-choice questions (MCQs) with 4 options and a correct key.
* `POST /notice/analyze`: Performs notices circular parsing, returning priority levels, key dates, action steps, estimated reading time, and recommended actions.
* `POST /study-plan`: Formulates a daily calendar study schedule leading up to an exam deadline.
* `POST /chat`: Employs conversational history memory to act as a supportive study coach.

---

## 🚀 Environment Setup & Startup

To run the FastAPI engine locally:

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# 3. Install core dependencies
pip install -r requirements.txt

# 4. Configure Groq API Key
# Create a .env file containing:
# GROQ_API_KEY=your_groq_api_key_here

# 5. Start the Uvicorn dev server on port 8001
uvicorn main:app --reload --port 8001
```
*Access the interactive API Swagger documentation by navigating to **http://localhost:8001/docs**.*
