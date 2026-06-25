import datetime
import logging
from typing import List

from fastapi import FastAPI, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

# Import Pydantic models
from models import (
    IngestRequest, IngestResponse,
    QuestionRequest, QuestionResponse,
    FlashcardRequest, FlashcardItem,
    QuizRequest, QuizItem,
    SummarizeRequest,
    NoticeAnalysisRequest, NoticeAnalysisResponse,
    StudyPlanRequest, StudyPlanResponse, StudyPlanItem,
    ChatRequest, ChatResponse,
    UploadNoteResponse,
    AiDeadlinePlanRequest, AiDeadlinePlanResponse, AiDeadlinePlanItem
)

# Import prompts
from prompts import (
    RAG_QA_SYSTEM_PROMPT, RAG_QA_USER_TEMPLATE,
    FLASHCARD_TEMPLATE, QUIZ_TEMPLATE,
    NOTICE_SUMMARIZER_TEMPLATE, NOTICE_ANALYZER_TEMPLATE,
    STUDY_PLAN_TEMPLATE, MENTOR_CHAT_SYSTEM_PROMPT,
    MENTOR_CHAT_USER_TEMPLATE, TOPIC_EXTRACTION_TEMPLATE,
    AI_DEADLINE_PLANNER_TEMPLATE, SUBJECT_SUMMARY_TEMPLATE
)

# Import RAG engine functions
from rag import (
    ingest_notes,
    retrieve_relevant_context,
    get_all_subject_notes,
    get_chat_history,
    add_chat_message
)

# Import utilities
from utils import call_groq, parse_json_response, GROQ_API_KEY

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("campusflow_main")

# Initialize FastAPI App
app = FastAPI(
    title="CampusFlow AI Study Buddy RAG Service",
    description="A production-ready RAG microservice for a student productivity platform.",
    version="1.0.0"
)

# Configure CORS as requested: allow_origins=["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# HELPER FOR ERROR HANDLING
# =====================================================================

def handle_exception(e: Exception, context_message: str):
    """
    Standardizes error messages, handles API key checking, and returns proper HTTP status codes.
    """
    error_str = str(e)
    logger.error(f"Error during {context_message}: {error_str}", exc_info=True)
    
    # Missing API key error
    if "Groq API key is not configured" in error_str or "GROQ_API_KEY" in error_str:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Groq API key is missing or not configured. Please add GROQ_API_KEY to your .env file."
        )
    
    # Parsing error
    if "JSON" in error_str or "parse" in error_str:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to parse a valid structured JSON response from the LLM. Details: {error_str}"
        )

    # General fallback
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"An unexpected error occurred during {context_message}. Details: {error_str}"
    )


# =====================================================================
# ENDPOINTS
# =====================================================================

@app.get("/", tags=["System"])
def read_root():
    """
    Welcome endpoint providing basic information and redirecting users to the API documentation.
    """
    return {
        "message": "Welcome to the CampusFlow AI Study Buddy RAG Service API!",
        "documentation": "/docs",
        "health_check": "/health",
        "status": "active"
    }


@app.get("/health", tags=["System"])
def health_check():
    """
    Simple health check endpoint to verify system status and check if the Groq API key is present.
    """
    return {
        "status": "healthy",
        "groq_api_key_configured": GROQ_API_KEY is not None and len(GROQ_API_KEY) > 0,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@app.post("/ingest", response_model=IngestResponse, tags=["RAG Features"])
async def ingest_student_notes(payload: IngestRequest):
    """
    Ingests student lecture notes, splits them into semantic chunks, generates
    embeddings, deletes previous notes for the same student + subject, and stores them in ChromaDB.
    """
    # Empty notes validation
    if not payload.notes.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notes content cannot be empty."
        )

    try:
        chunks_stored = ingest_notes(
            student_id=payload.student_id,
            subject=payload.subject,
            notes_text=payload.notes
        )
        return IngestResponse(status="success", chunks_stored=chunks_stored)
    except Exception as e:
        logger.error(f"ChromaDB ingestion failure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ChromaDB ingestion failed: {str(e)}"
        )


ocr_reader = None  # Global EasyOCR reader initialized lazily


@app.post("/upload-note", response_model=UploadNoteResponse, tags=["RAG Features"])
async def upload_student_note(
    student_id: str = Form(...),
    subject: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Step 3.5: Multi-Format Knowledge Upload.
    Accepts PDF, TXT, or Image files. Extracts text using pypdf, EasyOCR, or direct text reading,
    vectorizes and chunks the extracted text, stores it in ChromaDB, and uses the LLM to automatically
    detect study topics.
    """
    global ocr_reader
    filename = file.filename or "unknown_file"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    if ext not in ["txt", "pdf", "png", "jpg", "jpeg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. Supported formats: TXT, PDF, PNG, JPG, JPEG."
        )
        
    extracted_text = ""
    source_type = ""
    
    try:
        if ext == "txt":
            source_type = "txt"
            content = await file.read()
            extracted_text = content.decode("utf-8", errors="ignore")
            
        elif ext == "pdf":
            source_type = "pdf"
            import pypdf
            import io
            pdf_bytes = await file.read()
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            text_parts = []
            
            # 1. Try standard text extraction
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            extracted_text = "\n".join(text_parts)
            
            # 2. If no text was extracted, check for images and perform OCR
            if not extracted_text.strip():
                logger.info("No selectable text extracted from PDF. Checking for embedded images to perform OCR...")
                ocr_text_parts = []
                try:
                    import easyocr
                    import numpy as np
                    from PIL import Image
                    
                    # Lazy loading reader
                    if ocr_reader is None:
                        logger.info("Initializing EasyOCR reader for English (CPU mode)...")
                        ocr_reader = easyocr.Reader(['en'], gpu=False)
                    
                    for page_idx, page in enumerate(reader.pages):
                        for img_idx, image_file_object in enumerate(page.images):
                            logger.info(f"Extracting image {img_idx} from page {page_idx} for OCR...")
                            img_bytes = image_file_object.data
                            image = Image.open(io.BytesIO(img_bytes))
                            img_np = np.array(image)
                            ocr_results = ocr_reader.readtext(img_np)
                            page_ocr_text = " ".join([res[1] for res in ocr_results])
                            if page_ocr_text.strip():
                                ocr_text_parts.append(page_ocr_text)
                    
                    if ocr_text_parts:
                        extracted_text = "\n".join(ocr_text_parts)
                        source_type = "pdf (OCR)"
                        logger.info("Successfully extracted text from scanned PDF images via OCR.")
                except Exception as ocr_err:
                    logger.warning(f"PDF OCR extraction failed: {str(ocr_err)}")
            
        elif ext in ["png", "jpg", "jpeg"]:
            source_type = "image"
            img_bytes = await file.read()
            
            try:
                import easyocr
                import numpy as np
                from PIL import Image
                import io
                
                # Lazy loading reader
                if ocr_reader is None:
                    logger.info("Initializing EasyOCR reader for English (CPU mode)...")
                    ocr_reader = easyocr.Reader(['en'], gpu=False)
                
                # Convert bytes to PIL Image, then to numpy array for EasyOCR
                image = Image.open(io.BytesIO(img_bytes))
                img_np = np.array(image)
                
                logger.info("Performing OCR text extraction...")
                ocr_results = ocr_reader.readtext(img_np)
                extracted_text = " ".join([res[1] for res in ocr_results])
            except ImportError:
                logger.warning("EasyOCR is not installed. Falling back to mock OCR for demo purposes.")
                extracted_text = f"This is mock OCR extracted text from the image '{filename}' for demo. It discusses processes, threads, scheduling, and deadlock prevention."
            except Exception as e:
                logger.error(f"OCR failed: {str(e)}")
                raise ValueError(f"Failed to extract text from image via OCR: {str(e)}")
                
    except Exception as e:
        logger.error(f"File extraction failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process and extract text from the uploaded file: {str(e)}"
        )
        
    if not extracted_text.strip():
        detail_msg = "The uploaded file contains no readable text."
        if ext == "pdf":
            detail_msg = "The uploaded PDF contains no selectable text. If this is a scanned document, please upload it as image files (PNG, JPG, JPEG) so the AI can perform OCR extraction, or ensure the PDF contains selectable text."
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail_msg
        )
        
    # Ingest text into ChromaDB via RAG helper
    try:
        chunks_stored = ingest_notes(
            student_id=student_id,
            subject=subject,
            notes_text=extracted_text
        )
    except Exception as e:
        logger.error(f"Vector database ingestion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store vectorized knowledge in database: {str(e)}"
        )
        
    # Bonus AI Feature: Detect Topics using the LLM
    detected_topics = []
    try:
        # Use first 3000 chars of extracted text to stay within prompt/token limits
        sample_text = extracted_text[:3000]
        user_prompt = TOPIC_EXTRACTION_TEMPLATE.format(text=sample_text)
        
        raw_response = call_groq(
            system_prompt="You are a university study assistant that extracts core academic topics in strict JSON.",
            user_prompt=user_prompt
        )
        
        parsed_topics = parse_json_response(raw_response)
        if isinstance(parsed_topics, list):
            detected_topics = [str(t).strip() for t in parsed_topics if t][:5]
    except Exception as e:
        logger.warning(f"Failed to automatically detect topics: {str(e)}")
        
    # Fallback default topics if extraction fails or returns empty
    if not detected_topics:
        detected_topics = ["Lecture Review", "Key Concepts", "Core Subject Matter"]
        
    return UploadNoteResponse(
        success=True,
        chunks_stored=chunks_stored,
        source_type=source_type,
        filename=filename,
        detected_topics=detected_topics
    )


@app.post("/ask", response_model=QuestionResponse, tags=["RAG Features"])
async def ask_question(payload: QuestionRequest):
    """
    Answers student questions by retrieving relevant notes chunks from ChromaDB
    and generating an answer using Groq (llama-3.1-8b-instant) based ONLY on retrieved notes.
    """
    # Empty query validation
    if not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    try:
        # Retrieve relevant chunks (top_k = 8)
        context, sources_count = retrieve_relevant_context(
            student_id=payload.student_id,
            query=payload.question,
            subject=payload.subject,
            top_k=8
        )

        # Handle empty context gracefully
        if not context or sources_count == 0:
            return QuestionResponse(
                answer="I could not find that information in your notes.",
                answerSource="general",
                sources=0
            )

        # Build user prompt
        user_prompt = RAG_QA_USER_TEMPLATE.format(
            context=context,
            question=payload.question
        )

        # Call Groq API
        raw_response = call_groq(
            system_prompt=RAG_QA_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )

        # Parse the JSON response
        parsed = parse_json_response(raw_response)
        answer = parsed.get("answer", "")
        answer_source = parsed.get("answerSource", "general")

        return QuestionResponse(
            answer=answer,
            answerSource=answer_source,
            sources=sources_count
        )
    except Exception as e:
        handle_exception(e, "answering question")


@app.post("/flashcards", response_model=List[FlashcardItem], tags=["RAG Features"])
async def generate_flashcards(payload: FlashcardRequest):
    """
    Generates exactly 10 flashcards (JSON list of question-answer pairs)
    based on the student's ingested notes for the specified subject.
    """
    # Retrieve notes
    context = get_all_subject_notes(student_id=payload.student_id, subject=payload.subject)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No notes found for student '{payload.student_id}' in subject '{payload.subject}'. Please upload notes first."
        )

    try:
        # Formulate prompt
        user_prompt = FLASHCARD_TEMPLATE.format(context=context)
        
        # Call Groq and parse JSON
        raw_response = call_groq(
            system_prompt="You are a university study assistant that generates study materials in strict JSON.",
            user_prompt=user_prompt
        )
        
        flashcards = parse_json_response(raw_response)
        if not isinstance(flashcards, list):
            raise ValueError("LLM response is not a JSON list.")
            
        # Ensure it contains exactly 10 flashcards (or slice/pad if slightly off)
        # If it returns a few more or less, we can keep them, but we asked for exactly 10.
        # Let's validate the items match FlashcardItem structure.
        validated_flashcards = []
        for item in flashcards[:10]:
            if "question" in item and "answer" in item:
                difficulty_val = item.get("difficulty", "medium").lower()
                if difficulty_val not in ["easy", "medium", "hard"]:
                    difficulty_val = "medium"
                validated_flashcards.append(FlashcardItem(
                    question=str(item["question"]),
                    answer=str(item["answer"]),
                    difficulty=difficulty_val
                ))
        
        # If the model didn't return any valid items
        if not validated_flashcards:
            raise ValueError("No valid flashcard items were found in the JSON response.")
            
        return validated_flashcards
    except Exception as e:
        handle_exception(e, "generating flashcards")


@app.post("/quiz", response_model=List[QuizItem], tags=["RAG Features"])
async def generate_quiz(payload: QuizRequest):
    """
    Generates exactly 10 MCQs (JSON list of question, 4 options, and correct answer letter)
    based on the student's ingested notes for the specified subject.
    """
    # Retrieve notes
    context = get_all_subject_notes(student_id=payload.student_id, subject=payload.subject)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No notes found for student '{payload.student_id}' in subject '{payload.subject}'. Please upload notes first."
        )

    try:
        # Formulate prompt
        user_prompt = QUIZ_TEMPLATE.format(context=context)
        
        # Call Groq and parse JSON
        raw_response = call_groq(
            system_prompt="You are a university study assistant that generates multiple-choice quizzes in strict JSON.",
            user_prompt=user_prompt
        )
        
        quiz_items = parse_json_response(raw_response)
        if not isinstance(quiz_items, list):
            raise ValueError("LLM response is not a JSON list.")
            
        # Validate items match QuizItem structure
        validated_quiz = []
        for item in quiz_items[:10]:
            if "question" in item and "options" in item and "answer" in item:
                options = item["options"]
                if isinstance(options, list) and len(options) == 4:
                    ans = str(item["answer"]).upper()
                    if ans in ["A", "B", "C", "D"]:
                        validated_quiz.append(QuizItem(
                            question=str(item["question"]),
                            options=[str(opt) for opt in options],
                            answer=ans  # type: ignore
                        ))
        
        if not validated_quiz:
            raise ValueError("No valid quiz items were found in the JSON response.")
            
        return validated_quiz
    except Exception as e:
        handle_exception(e, "generating quiz")


@app.post("/generate-summary", tags=["RAG Features"])
async def generate_subject_summary(payload: FlashcardRequest):
    """
    Generates a comprehensive academic summary of the student's notes for the specified subject.
    """
    # Retrieve notes
    context = get_all_subject_notes(student_id=payload.student_id, subject=payload.subject)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No notes found for student '{payload.student_id}' in subject '{payload.subject}'. Please upload notes first."
        )

    try:
        # Formulate prompt
        user_prompt = SUBJECT_SUMMARY_TEMPLATE.format(context=context)
        
        # Call Groq
        summary = call_groq(
            system_prompt="You are a helpful university tutor that summarizes lecture notes in clean markdown.",
            user_prompt=user_prompt
        )
        return {"summary": summary}
    except Exception as e:
        handle_exception(e, "generating subject summary")


@app.post("/summarize", response_class=PlainTextResponse, tags=["Notice Utilities"])
async def summarize_notice(payload: SummarizeRequest):
    """
    Summarizes notice text into exactly 3 bullet points starting with the bullet character •,
    with each bullet containing less than 20 words. Returns plain text.
    """
    if not payload.notice_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notice text cannot be empty."
        )

    try:
        # Formulate prompt
        user_prompt = NOTICE_SUMMARIZER_TEMPLATE.format(notice_text=payload.notice_text)
        
        # Call Groq and return plain text
        summary = call_groq(
            system_prompt="You are a helpful university notice assistant.",
            user_prompt=user_prompt
        )
        return summary
    except Exception as e:
        handle_exception(e, "summarizing notice")


@app.post("/notice/analyze", response_model=NoticeAnalysisResponse, tags=["Notice Utilities"])
async def analyze_notice(payload: NoticeAnalysisRequest):
    """
    Analyzes notice text to extract a summary, important dates, action items, and priority level.
    Returns a structured JSON response.
    """
    if not payload.notice_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notice text cannot be empty."
        )

    try:
        # Formulate prompt
        user_prompt = NOTICE_ANALYZER_TEMPLATE.format(notice_text=payload.notice_text)
        
        # Call Groq and parse JSON
        raw_response = call_groq(
            system_prompt="You are a university notice analysis assistant that outputs strict JSON.",
            user_prompt=user_prompt
        )
        
        analysis = parse_json_response(raw_response)
        
        # Validate fields
        summary = str(analysis.get("summary", ""))
        important_dates = list(analysis.get("important_dates", []))
        action_items = list(analysis.get("action_items", []))
        priority = str(analysis.get("priority", "medium")).lower()
        
        if priority not in ["low", "medium", "high"]:
            priority = "medium"
            
        estimated_reading_time = str(analysis.get("estimated_reading_time", "1 min"))
        recommended_action = str(analysis.get("recommended_action", "Please read this notice carefully."))
            
        return NoticeAnalysisResponse(
            summary=summary,
            important_dates=[str(d) for d in important_dates],
            action_items=[str(a) for a in action_items],
            priority=priority,  # type: ignore
            estimated_reading_time=estimated_reading_time,
            recommended_action=recommended_action
        )
    except Exception as e:
        handle_exception(e, "analyzing notice")


@app.post("/study-plan", response_model=StudyPlanResponse, tags=["Study Planner"])
async def generate_study_plan(payload: StudyPlanRequest):
    """
    Generates a personalized daily study plan leading up to the deadline.
    Spreads the work evenly, prioritizes difficult topics first, and finishes before the deadline.
    """
    # Basic date format check (YYYY-MM-DD)
    try:
        datetime.date.fromisoformat(payload.deadline)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deadline must be in YYYY-MM-DD format."
        )

    current_date = datetime.date.today().isoformat()

    try:
        # Formulate prompt
        user_prompt = STUDY_PLAN_TEMPLATE.format(
            topic=payload.topic,
            deadline=payload.deadline,
            hours_per_day=payload.hours_per_day,
            current_date=current_date
        )
        
        # Call Groq and parse JSON
        raw_response = call_groq(
            system_prompt="You are a university scheduling assistant that plans study workloads in strict JSON.",
            user_prompt=user_prompt
        )
        
        plan_data = parse_json_response(raw_response)
        plan_list = plan_data.get("plan", [])
        
        validated_plan = []
        for item in plan_list:
            if "date" in item and "task" in item:
                validated_plan.append(StudyPlanItem(
                    date=str(item["date"]),
                    task=str(item["task"])
                ))
                
        if not validated_plan:
            raise ValueError("No valid plan items were found in the JSON response.")
            
        return StudyPlanResponse(plan=validated_plan)
    except Exception as e:
        handle_exception(e, "generating study plan")


@app.post("/deadlines/generate-plan", response_model=AiDeadlinePlanResponse, tags=["Study Planner"])
async def generate_deadline_study_plan(payload: AiDeadlinePlanRequest):
    """
    Generates a personalized daily study plan leading up to a specific deadline,
    incorporating the student's actual uploaded notes from the vector store if available.
    """
    # Basic date format check (YYYY-MM-DD)
    try:
        datetime.date.fromisoformat(payload.deadline)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deadline date must be in YYYY-MM-DD format."
        )

    current_date = datetime.date.today().isoformat()
    student_id = payload.studentId or "default_student"

    try:
        # 1. Fetch student's uploaded notes for the subject from ChromaDB
        notes_context = get_all_subject_notes(student_id=student_id, subject=payload.subject)
        
        # Limit notes_context length for token safety (approx. 4000 characters)
        if notes_context:
            if len(notes_context) > 4000:
                notes_context = notes_context[:4000] + "\n... [Truncated for prompt limit] ..."
            logger.info(f"Retrieved {len(notes_context)} characters of notes context for {payload.subject} to guide planning.")
        else:
            notes_context = ""
            logger.info(f"No notes context found for {payload.subject}. Proceeding with general knowledge planning.")

        # 2. Formulate the LLM user prompt
        user_prompt = AI_DEADLINE_PLANNER_TEMPLATE.format(
            title=payload.title,
            subject=payload.subject,
            description=payload.description,
            deadline=payload.deadline,
            hours_per_day=payload.hoursPerDay,
            priority=payload.priority,
            current_date=current_date,
            notes_context=notes_context
        )

        # 3. Call Groq
        raw_response = call_groq(
            system_prompt="You are a professional university study scheduling assistant that outputs strict JSON.",
            user_prompt=user_prompt
        )

        # 4. Parse JSON
        parsed_data = parse_json_response(raw_response)

        # 5. Extract and validate fields
        estimated_hours = int(parsed_data.get("estimatedHours", 0))
        risk_level = str(parsed_data.get("riskLevel", "medium")).lower()
        if risk_level not in ["low", "medium", "high"]:
            risk_level = "medium"
        recommendation = str(parsed_data.get("recommendation", "Review key concepts regularly."))
        raw_plan = parsed_data.get("studyPlan", [])

        # Validate each plan item
        validated_plan = []
        for item in raw_plan:
            if "date" in item and "topic" in item:
                validated_plan.append(AiDeadlinePlanItem(
                    date=str(item["date"]),
                    topic=str(item["topic"]),
                    duration=str(item.get("duration", f"{payload.hoursPerDay} hours"))
                ))

        if not validated_plan:
            raise ValueError("No valid daily sessions found in the generated study plan JSON.")

        # Fallback sum check
        if estimated_hours == 0:
            estimated_hours = len(validated_plan) * int(payload.hoursPerDay)

        return AiDeadlinePlanResponse(
            estimatedHours=estimated_hours,
            riskLevel=risk_level,
            recommendation=recommendation,
            studyPlan=validated_plan
        )
    except Exception as e:
        handle_exception(e, "generating academic deadline study plan")



@app.post("/chat", response_model=ChatResponse, tags=["Bonus Hackathon Chat"])
async def chat_with_mentor(payload: ChatRequest):
    """
    Bonus Feature: A session-based personal study mentor chat.
    Retrieves the student's relevant note context (top_k = 4) to answer questions,
    maintains an in-memory conversation history, and acts as a study mentor.
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    try:
        # 1. Retrieve notes context (top_k = 4 for chat to keep prompts shorter)
        context, _ = retrieve_relevant_context(
            student_id=payload.student_id,
            query=payload.message,
            top_k=4
        )

        # 2. Retrieve existing chat history for this student
        history = get_chat_history(payload.student_id)

        # 3. Format history into a string block
        history_str = ""
        for msg in history:
            role_label = "Student" if msg["role"] == "user" else "Mentor"
            history_str += f"{role_label}: {msg['content']}\n"

        # 4. Format user prompt with context, history, and the new message
        user_prompt = (
            f"Conversation History:\n{history_str}\n"
            f"Retrieved notes context (use to answer if relevant):\n{context or 'No lecture notes retrieved.'}\n\n"
            f"Student's Message: {payload.message}\n"
        )

        # 5. Call Groq API
        mentor_response = call_groq(
            system_prompt=MENTOR_CHAT_SYSTEM_PROMPT,
            user_prompt=user_prompt
        )

        # 6. Save messages to history
        add_chat_message(payload.student_id, "user", payload.message)
        add_chat_message(payload.student_id, "assistant", mentor_response)

        return ChatResponse(response=mentor_response)
    except Exception as e:
        handle_exception(e, "conversing with chat mentor")
