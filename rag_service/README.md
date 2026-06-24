# CampusFlow AI Study Buddy - RAG Microservice

CampusFlow is a production-ready, highly optimized Retrieval-Augmented Generation (RAG) microservice designed for a student productivity platform. It empowers students to upload lecture notes, ask questions from their notes, generate flashcards and multiple-choice quizzes, summarize and analyze academic notices, create tailored study plans from deadlines, and converse with a personal study mentor.

Optimized for rapid hackathon demos, it features fast response times, a clean architecture, fully in-memory vector storage (no persistent database required), and seamless integration.

## Tech Stack
* **Language:** Python 3.11+
* **API Framework:** FastAPI & Uvicorn
* **Vector Database:** ChromaDB (In-Memory client)
* **Embedding Model:** SentenceTransformers (`all-MiniLM-L6-v2`, initialized globally)
* **LLM Engine:** Groq API (`llama3-8b-8192` model with temperature `0.3`)
* **Text Chunking:** LangChain RecursiveCharacterTextSplitter (chunk size: 500, overlap: 100)
* **Validation:** Pydantic v2

---

## Project Structure
```text
rag_service/
├── main.py             # FastAPI App, routing, and error handling
├── rag.py              # Embedding generation, ChromaDB ingestion, retrieval, and chat history
├── models.py           # Pydantic validation schemas (requests & responses)
├── prompts.py          # Centralized LLM prompt templates
├── utils.py            # Groq API client helper and robust JSON parsing/sanitization utilities
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
└── README.md           # Documentation & instructions (this file)
```

---

## Setup Instructions

### 1. Clone or Navigate to the Directory
Ensure you are in the `rag_service` directory:
```bash
cd campusflow/rag_service
```

### 2. Create and Activate a Virtual Environment
It is highly recommended to use a virtual environment to manage dependencies:
```bash
# On Windows:
python -m venv venv
venv\Scripts\activate

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install all required packages from `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy the `.env.example` to `.env` and fill in your Groq API key:
```bash
# Windows Command Prompt / PowerShell:
copy .env.example .env

# Linux/macOS:
cp .env.example .env
```
Open the `.env` file and set your key:
```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```
*Note: If the key is missing, the server will start successfully but will return clean HTTP 500 errors on LLM-dependent endpoints, prompting you to configure it.*

### 5. Run the Application
Start the FastAPI development server using Uvicorn on port `8001`:
```bash
uvicorn main:app --reload --port 8001
```
The interactive Swagger API documentation will be available at: **http://127.0.0.1:8001/docs**

---

## API Endpoints & Curl Examples

### 1. Health Check
* **Endpoint:** `GET /health`
* **Purpose:** Checks system status and verifies if the Groq API key is loaded.
* **Curl Example:**
  ```bash
  curl -X GET "http://127.0.0.1:8001/health"
  ```
* **Sample Output:**
  ```json
  {
    "status": "healthy",
    "groq_api_key_configured": true,
    "timestamp": "2026-06-24T17:10:00.123456"
  }
  ```

---

### 2. Note Ingestion
* **Endpoint:** `POST /ingest`
* **Purpose:** Splits text into semantic chunks, creates vector embeddings, deletes any previous notes for the same student + subject combination, and stores the new notes in the vector database.
* **Curl Example:**
  ```bash
  curl -X POST "http://127.0.0.1:8001/ingest" \
       -H "Content-Type: application/json" \
       -d '{
         "student_id": "student_123",
         "subject": "OS",
         "notes": "Operating System (OS) is a software that acts as an interface between computer hardware components and the user. A deadlock occurs when two or more processes are unable to proceed because each is waiting for the other to release a resource. The four necessary conditions for deadlock to occur are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Deadlock can be prevented by breaking one of these four conditions, or avoided using algorithms like Banker'\''s Algorithm."
       }'
  ```
* **Sample Output:**
  ```json
  {
    "status": "success",
    "chunks_stored": 2
  }
  ```

---

### 3. Ask Questions
* **Endpoint:** `POST /ask`
* **Purpose:** Performs semantic search over the student's notes, compiles context from the top 8 chunks, and answers the query based ONLY on the notes.
* **Curl Example:**
  ```bash
  curl -X POST "http://127.0.0.1:8001/ask" \
       -H "Content-Type: application/json" \
       -d '{
         "student_id": "student_123",
         "question": "What is a deadlock and what are its four necessary conditions?"
       }'
  ```
* **Sample Output:**
  ```json
  {
    "answer": "A deadlock occurs when two or more processes are unable to proceed because each is waiting for another process to release a resource. The four necessary conditions for deadlock to occur are:\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait.",
    "sources": 2
  }
  ```

---

### 4. Flashcard Generator
* **Endpoint:** `POST /flashcards`
* **Purpose:** Retrieves the student's subject notes and generates exactly 10 flashcards (question/answer pairs) returned as a strict JSON array.
* **Curl Example:**
  ```bash
  curl -X POST "http://127.0.0.1:8001/flashcards" \
       -H "Content-Type: application/json" \
       -d '{
         "student_id": "student_123",
         "subject": "OS"
       }'
  ```
* **Sample Output:**
  ```json
  [
    {
      "question": "What is an Operating System?",
      "answer": "A software that acts as an interface between computer hardware components and the user."
    },
    {
      "question": "What is a deadlock?",
      "answer": "A situation where two or more processes cannot proceed because they are waiting on resources held by each other."
    },
    ...
  ]
  ```

---

### 5. Multiple Choice Quiz Generator
* **Endpoint:** `POST /quiz`
* **Purpose:** Retrieves the student's subject notes and generates exactly 10 multiple-choice questions (MCQs) with 4 options and the correct answer letter.
* **Curl Example:**
  ```bash
  curl -X POST "http://127.0.0.1:8001/quiz" \
       -H "Content-Type: application/json" \
       -d '{
         "student_id": "student_123",
         "subject": "OS"
       }'
  ```
* **Sample Output:**
  ```json
  [
    {
      "question": "Which of the following is NOT one of the four necessary conditions for a deadlock to occur?",
      "options": [
        "A) Mutual Exclusion",
        "B) Hold and Wait",
        "C) Preemption",
        "D) Circular Wait"
      ],
      "answer": "C"
    },
    ...
  ]
  ```

---

### 6. Notice Summarizer
* **Endpoint:** `POST /summarize`
* **Purpose:** Summarizes administrative or academic notices into exactly 3 bullet points starting with `•`, with each bullet under 20 words. Returns plain text.
* **Curl Example:**
  ```bash
  curl -X POST "http://127.0.0.1:8001/summarize" \
       -H "Content-Type: application/json" \
       -d '{
         "notice_text": "Attention all students, the mid-semester examination for the Operating Systems course has been scheduled for July 5th, 2026. The exam will start at 10:00 AM in Hall A. Students must carry their university ID cards and are advised to arrive 30 minutes prior to the scheduled time. Scientific calculators are permitted, but programmable devices or mobile phones are strictly prohibited. Safe seating plans will be displayed outside the hall on the day of the exam. For any syllabus queries, contact the course coordinator before July 1st."
       }'
  ```
* **Sample Output:**
  ```text
  • Mid-semester exam scheduled for July 5th, 2026 at 10:00 AM in Hall A.
  • Students must bring university ID cards and arrive 30 minutes early.
  • Calculators are allowed, but phones and programmable devices are strictly prohibited.
  ```

---

### 7. Notice Analyzer
* **Endpoint:** `POST /notice/analyze`
* **Purpose:** Analyzes notice text and extracts a structured JSON object containing a summary, important dates, action items, and a priority level (low, medium, or high).
* **Curl Example:**
  ```bash
  curl -X POST "http://127.0.0.1:8001/notice/analyze" \
       -H "Content-Type: application/json" \
       -d '{
         "notice_text": "Attention all students, the mid-semester examination for the Operating Systems course has been scheduled for July 5th, 2026. The exam will start at 10:00 AM in Hall A. Students must carry their university ID cards and are advised to arrive 30 minutes prior to the scheduled time. Scientific calculators are permitted, but programmable devices or mobile phones are strictly prohibited. Safe seating plans will be displayed outside the hall on the day of the exam. For any syllabus queries, contact the course coordinator before July 1st."
       }'
  ```
* **Sample Output:**
  ```json
  {
    "summary": "The Operating Systems mid-semester exam is scheduled for July 5th, 2026 at 10:00 AM in Hall A, with specific conduct rules.",
    "important_dates": [
      "July 5th, 2026 (Exam Date)",
      "July 1st, 2026 (Deadline to contact coordinator)"
    ],
    "action_items": [
      "Carry university ID card to the exam.",
      "Arrive 30 minutes prior to 10:00 AM.",
      "Ensure any syllabus queries are addressed before July 1st."
    ],
    "priority": "high"
  }
  ```

---

### 8. Study Plan Generator
* **Endpoint:** `POST /study-plan`
* **Purpose:** Automatically builds a daily study timeline leading to a deadline date. It spreads the workload evenly, prioritizes difficult concepts first, and schedules tasks day-by-day.
* **Curl Example:**
  ```bash
  curl -X POST "http://127.0.0.1:8001/study-plan" \
       -H "Content-Type: application/json" \
       -d '{
         "topic": "Database Management Systems (DBMS)",
         "deadline": "2026-07-01",
         "hours_per_day": 2
       }'
  ```
* **Sample Output:**
  ```json
  {
    "plan": [
      {
        "date": "2026-06-25",
        "task": "Study relational model and relational algebra fundamentals (difficult, core concept)."
      },
      {
        "date": "2026-06-26",
        "task": "Learn database normalization theory: 1NF, 2NF, 3NF, and BCNF (difficult, core concept)."
      },
      {
        "date": "2026-06-27",
        "task": "Study SQL queries, joins, subqueries, and aggregate functions."
      },
      {
        "date": "2026-06-28",
        "task": "Understand transactions, ACID properties, and concurrency control."
      },
      {
        "date": "2026-06-29",
        "task": "Learn indexing, hashing, and database storage structures."
      },
      {
        "date": "2026-06-30",
        "task": "Comprehensive review of all topics and practice previous years' exam questions."
      }
    ]
  }
  ```

---

### 9. Study Mentor Chat (Bonus Feature)
* **Endpoint:** `POST /chat`
* **Purpose:** A session-based chatbot that retrieves the student's notes, maintains conversational history in-memory for the current session, and responds in the tone of an encouraging and empathetic study mentor.
* **Curl Example:**
  ```bash
  curl -X POST "http://127.0.0.1:8001/chat" \
       -H "Content-Type: application/json" \
       -d '{
         "student_id": "student_123",
         "message": "Can you explain deadlocks simply and tell me how I can explain it in my exam?"
       }'
  ```
* **Sample Output:**
  ```json
  {
    "response": "Hello! I would be happy to explain deadlocks simply. Think of a deadlock like a traffic gridlock where four cars arrive at an intersection at the exact same time, and each car is blocking the next one. No one can move forward because everyone is waiting for someone else to move. In computers, it happens when Process A holds Resource 1 and waits for Resource 2, while Process B holds Resource 2 and waits for Resource 1. Neither can finish! For your exam, you can explain it using this simple 'hold-and-wait' example, and be sure to list the four necessary conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. You've got this!"
  }
  ```

---

## Error Handling

The microservice implements rigorous error validation and maps failures to standard HTTP responses:
* **Missing API Key:** If `GROQ_API_KEY` is not present in `.env`, calling any RAG or utility endpoint returns:
  * Status code: `500 Internal Server Error`
  * Body: `{"detail": "Groq API key is missing or not configured. Please add GROQ_API_KEY to your .env file."}`
* **Empty Notes or Queries:** Returns `400 Bad Request`.
* **Database Failures:** Catches and returns `500 Internal Server Error`.
* **Invalid JSON from LLM:** If the LLM output fails to parse, it will return `502 Bad Gateway` detailing the parsing error.
