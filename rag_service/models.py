from pydantic import BaseModel, Field
from typing import List, Literal

# =====================================================================
# REQUEST SCHEMAS
# =====================================================================

class IngestRequest(BaseModel):
    student_id: str = Field(..., description="Unique identifier for the student", min_length=1)
    subject: str = Field(..., description="The subject or course name", min_length=1)
    notes: str = Field(..., description="The lecture notes content to ingest", min_length=1)

class QuestionRequest(BaseModel):
    student_id: str = Field(..., description="Unique identifier for the student", min_length=1)
    question: str = Field(..., description="The question to ask based on the student's notes", min_length=1)

class FlashcardRequest(BaseModel):
    student_id: str = Field(..., description="Unique identifier for the student", min_length=1)
    subject: str = Field(..., description="The subject to generate flashcards for", min_length=1)

class QuizRequest(BaseModel):
    student_id: str = Field(..., description="Unique identifier for the student", min_length=1)
    subject: str = Field(..., description="The subject to generate a quiz for", min_length=1)

class SummarizeRequest(BaseModel):
    notice_text: str = Field(..., description="The full text of the notice to summarize", min_length=1)

class NoticeAnalysisRequest(BaseModel):
    notice_text: str = Field(..., description="The full text of the notice to analyze", min_length=1)

class StudyPlanRequest(BaseModel):
    topic: str = Field(..., description="The topic to create a study plan for", min_length=1)
    deadline: str = Field(..., description="The target deadline date (YYYY-MM-DD)", min_length=10, max_length=10)
    hours_per_day: float = Field(..., description="Number of hours available to study per day", gt=0)

class ChatRequest(BaseModel):
    student_id: str = Field(..., description="Unique identifier for the student", min_length=1)
    message: str = Field(..., description="The user's message to the study mentor", min_length=1)


# =====================================================================
# RESPONSE SCHEMAS
# =====================================================================

class IngestResponse(BaseModel):
    status: str = Field("success", description="Status of the ingestion operation")
    chunks_stored: int = Field(..., description="Number of text chunks split and stored in ChromaDB")

class QuestionResponse(BaseModel):
    answer: str = Field(..., description="The generated answer from the notes context")
    sources: int = Field(..., description="The number of source chunks retrieved and used for context")

class FlashcardItem(BaseModel):
    question: str = Field(..., description="The question or prompt of the flashcard")
    answer: str = Field(..., description="The answer to the question")

class QuizItem(BaseModel):
    question: str = Field(..., description="The question text")
    options: List[str] = Field(..., description="Four multiple-choice options", min_items=4, max_items=4)
    answer: Literal["A", "B", "C", "D"] = Field(..., description="The correct option letter")

class NoticeAnalysisResponse(BaseModel):
    summary: str = Field(..., description="Brief executive summary of the notice")
    important_dates: List[str] = Field(..., description="Extracted dates mentioned in the notice")
    action_items: List[str] = Field(..., description="List of tasks/action items for the student")
    priority: Literal["low", "medium", "high"] = Field(..., description="Priority level of the notice")

class StudyPlanItem(BaseModel):
    date: str = Field(..., description="The study date (YYYY-MM-DD)")
    task: str = Field(..., description="The specific study task or subtopic to cover")

class StudyPlanResponse(BaseModel):
    plan: List[StudyPlanItem] = Field(..., description="List of scheduled study tasks leading up to the deadline")

class ChatResponse(BaseModel):
    response: str = Field(..., description="The chat mentor's response")
