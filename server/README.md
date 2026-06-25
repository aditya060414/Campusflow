# CampusFlow — Node.js & Express API Gateway

The Express server serves as a secure, fail-safe **API Gateway Proxy** that handles student authentication sessions, validates incoming payload schemas, and forwards request threads directly to the Python FastAPI RAG microservice.

It is designed to be highly resilient: if MongoDB Atlas is unavailable, it automatically falls back to an in-memory session mode, making it plug-and-play for hackathon demonstrations.

---

## 🛠️ Key Architectural Duties

### 1. Transparent RAG Proxying
* Proxies incoming HTTP requests directly to the Python FastAPI service, shielding the Python AI engine from direct public access.
* Translates FastAPI backend exceptions or connection issues into friendly, actionable JSON error messages for the frontend client.

### 2. Multi-Format File Upload Middleware
* Integrates `multer` to capture binary files (PDFs, images, TXT files) uploaded by students.
* Utilizes `form-data` to bundle the file buffer, student ID, and subject, and securely stream them as a multipart payload to the FastAPI RAG service.

### 3. Fail-Safe Database Fallback
* Connects optionally to MongoDB Atlas if `MONGO_URI` is provided in the environment configuration.
* If no URI is present, it prints a console warning and proceeds in in-memory mode, ensuring the server runs flawlessly on any local development machine.

---

## 📁 Directory Structure

```text
server/
├── routes/
│   └── ragRoutes.js        # Standardizes API paths (/api/rag/*)
│
├── controllers/
│   └── ragController.js    # Validates payload parameters and file parameters
│
├── services/
│   └── ragService.js       # Core Axios proxy forwarding requests to FastAPI
│
├── app.js                  # Configures Express middleware, CORS, and DB hooks
└── server.js               # Binds the Express server to its active PORT
```

---

## 🔌 API Endpoints Exposed

All API routes are prefixed with `/api/rag`:

| Endpoint | Method | Payload (JSON) | Description |
| :--- | :--- | :--- | :--- |
| `/ingest` | `POST` | `{ student_id, subject, notes }` | Vectorizes and chunk-indexes plain text lecture notes. |
| `/upload` | `POST` | `FormData: { student_id, subject, file }` | Uploads PDF/Images/TXT, extracts text (PDF parsing & OCR), and vectorizes. |
| `/ask` | `POST` | `{ student_id, question }` | Queries vector database and returns cited answers. |
| `/flashcards` | `POST` | `{ student_id, subject }` | Generates 10 difficulty-rated flashcards. |
| `/quiz` | `POST` | `{ student_id, subject }` | Generates a 10-question MCQ mock exam. |
| `/notice/analyze` | `POST` | `{ notice_text }` | Circular analyzer (reading-time, actions, priority). |

---

## 🚀 Installation & Running

To run the Express gateway locally:

```bash
# 1. Install gateway packages
npm install

# 2. Configure environment
# Create a .env file containing:
# PORT=5000
# RAG_SERVICE_URL=http://localhost:8001
# MONGO_URI=optional_mongodb_uri_here

# 3. Start development server (using nodemon)
npm run dev
```
*The gateway will start on **http://localhost:5000** and securely proxy all incoming `/api/rag` calls to the Python service running on port `8001`.*
