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
    subject: str = Field(None, description="The subject name to restrict the vector search context")

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

class AiDeadlinePlanRequest(BaseModel):
    studentId: str = Field("default_student", description="Unique identifier for the student")
    title: str = Field(..., description="The title of the deadline", min_length=1)
    subject: str = Field(..., description="The subject or course name", min_length=1)
    description: str = Field(..., description="Syllabus details or description of the deadline", min_length=1)
    deadline: str = Field(..., description="The target deadline date (YYYY-MM-DD)", min_length=10, max_length=10)
    hoursPerDay: float = Field(..., description="Number of hours available to study per day", gt=0)
    priority: str = Field(..., description="Priority level of the deadline (low, medium, high)", min_length=3)
    type: str = Field("Assignment", description="Type of deadline (Exam, Assignment, Project)")


# =====================================================================
# RESPONSE SCHEMAS
# =====================================================================

class IngestResponse(BaseModel):
    status: str = Field("success", description="Status of the ingestion operation")
    chunks_stored: int = Field(..., description="Number of text chunks split and stored in ChromaDB")

class QuestionResponse(BaseModel):
    answer: str = Field(..., description="The generated answer from the notes context")
    answerSource: Literal["notes", "hybrid", "general"] = Field("general", description="The source classification of the answer")
    sources: int = Field(..., description="The number of source chunks retrieved and used for context")

class FlashcardItem(BaseModel):
    question: str = Field(..., description="The question or prompt of the flashcard")
    answer: str = Field(..., description="The answer to the question")
    difficulty: Literal["easy", "medium", "hard"] = Field("medium", description="The difficulty level of the flashcard")

class QuizItem(BaseModel):
    question: str = Field(..., description="The question text")
    options: List[str] = Field(..., description="Four multiple-choice options", min_items=4, max_items=4)
    answer: Literal["A", "B", "C", "D"] = Field(..., description="The correct option letter")

class NoticeAnalysisResponse(BaseModel):
    summary: str = Field(..., description="Brief executive summary of the notice")
    important_dates: List[str] = Field(..., description="Extracted dates mentioned in the notice")
    action_items: List[str] = Field(..., description="List of tasks/action items for the student")
    priority: Literal["low", "medium", "high"] = Field(..., description="Priority level of the notice")
    estimated_reading_time: str = Field("1 min", description="Estimated reading time for the notice")
    recommended_action: str = Field(..., description="Recommended action for the student based on the notice")

class StudyPlanItem(BaseModel):
    date: str = Field(..., description="The study date (YYYY-MM-DD)")
    task: str = Field(..., description="The specific study task or subtopic to cover")

class StudyPlanResponse(BaseModel):
    plan: List[StudyPlanItem] = Field(..., description="List of scheduled study tasks leading up to the deadline")

class AiDeadlinePlanItem(BaseModel):
    date: str = Field(..., description="The study date (YYYY-MM-DD)")
    topic: str = Field(..., description="The specific study topic or task scheduled")
    duration: str = Field(..., description="The duration of the study session, e.g. '2 hours'")

class AiDeadlinePlanResponse(BaseModel):
    estimatedHours: int = Field(..., description="Total estimated study hours needed")
    riskLevel: Literal["low", "medium", "high"] = Field("medium", description="Calculated risk level")
    recommendation: str = Field(..., description="AI personalized recommendation")
    studyPlan: List[AiDeadlinePlanItem] = Field(..., description="Day-by-day study roadmap")

class ChatResponse(BaseModel):
    response: str = Field(..., description="The chat mentor's response")

class UploadNoteResponse(BaseModel):
    success: bool = Field(True, description="Whether the ingestion succeeded")
    chunks_stored: int = Field(..., description="Number of text chunks split and stored in ChromaDB")
    source_type: str = Field(..., description="The detected format: pdf, txt, or image")
    filename: str = Field(..., description="The name of the uploaded file")
    detected_topics: List[str] = Field(..., description="List of key topics detected from the uploaded notes")
