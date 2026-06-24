# =====================================================================
# SYSTEM PROMPTS
# =====================================================================

RAG_QA_SYSTEM_PROMPT = (
    "You are a university study assistant.\n"
    "Answer ONLY using the provided context.\n"
    "If the answer does not exist in the context, say:\n"
    "\"I could not find that information in your notes.\"\n"
    "Do not hallucinate."
)

MENTOR_CHAT_SYSTEM_PROMPT = (
    "You are a personal study mentor for CampusFlow, a student productivity platform.\n"
    "Act as a supportive, encouraging, knowledgeable, and empathetic study mentor.\n"
    "You have access to some of the student's retrieved notes, which you should use as context to answer their questions if relevant.\n"
    "If the question is not directly answered in their notes, you can still answer using your general educational knowledge, "
    "but always steer the conversation towards helping them learn, manage their time, and succeed.\n"
    "Keep your answers concise, clear, and friendly. Do not mention technical details like 'RAG', 'ChromaDB', or 'context retrieval'."
)


# =====================================================================
# USER PROMPTS / TEMPLATES
# =====================================================================

RAG_QA_USER_TEMPLATE = (
    "Context from student notes:\n"
    "---------------------\n"
    "{context}\n"
    "---------------------\n\n"
    "Question: {question}\n\n"
    "Answer:"
)

FLASHCARD_TEMPLATE = (
    "Based on the provided lecture notes context, generate exactly 10 high-quality flashcards.\n"
    "Each flashcard must have a 'question' testing a core concept, and a detailed but concise 'answer'.\n\n"
    "You MUST return the flashcards in strict JSON format as a list of objects.\n"
    "Each object in the list must have exactly these keys: 'question' and 'answer'.\n\n"
    "CRITICAL: Do NOT include any markdown formatting, do NOT wrap the response in markdown code blocks (such as ```json ... ```), "
    "do NOT provide any introductions, explanations, or additional text. Return ONLY the raw JSON array.\n\n"
    "Lecture Notes Context:\n"
    "---------------------\n"
    "{context}\n"
    "---------------------\n"
)

QUIZ_TEMPLATE = (
    "Based on the provided lecture notes context, generate exactly 10 multiple-choice questions (MCQs).\n"
    "Each MCQ must test the student's understanding of key concepts in the notes.\n\n"
    "You MUST return the MCQs in strict JSON format as a list of objects.\n"
    "Each object in the list must have exactly these keys:\n"
    "- 'question': The question text\n"
    "- 'options': A list of exactly 4 options (strings)\n"
    "- 'answer': The correct option letter, which must be exactly one of: \"A\", \"B\", \"C\", or \"D\"\n\n"
    "CRITICAL: Do NOT include any markdown formatting, do NOT wrap the response in markdown code blocks (such as ```json ... ```), "
    "do NOT provide any introductions, explanations, or additional text. Return ONLY the raw JSON array.\n\n"
    "Lecture Notes Context:\n"
    "---------------------\n"
    "{context}\n"
    "---------------------\n"
)

NOTICE_SUMMARIZER_TEMPLATE = (
    "Summarize the following notice in exactly 3 bullet points.\n"
    "Use the bullet character •.\n"
    "Each bullet must be less than 20 words.\n"
    "Return plain text only. Do not add any introductory or concluding remarks.\n\n"
    "Notice Text:\n"
    "{notice_text}\n"
)

NOTICE_ANALYZER_TEMPLATE = (
    "Analyze the following notice and extract key information in strict JSON format.\n"
    "The JSON object must contain exactly the following keys:\n"
    "- 'summary': A brief executive summary of the notice (string)\n"
    "- 'important_dates': A list of all dates, deadlines, or timings mentioned (list of strings)\n"
    "- 'action_items': A list of clear, actionable steps for the student (list of strings)\n"
    "- 'priority': The urgency/importance level, which must be exactly one of: \"low\", \"medium\", or \"high\" (string)\n\n"
    "CRITICAL: Do NOT include any markdown formatting, do NOT wrap the response in markdown code blocks (such as ```json ... ```), "
    "do NOT provide any introductions, explanations, or additional text. Return ONLY the raw JSON object.\n\n"
    "Notice Text:\n"
    "{notice_text}\n"
)

STUDY_PLAN_TEMPLATE = (
    "Create a highly structured daily study plan for the topic '{topic}' leading up to the deadline '{deadline}'.\n"
    "The current date is {current_date}.\n"
    "The student can study {hours_per_day} hours per day.\n\n"
    "The plan MUST:\n"
    "1. Spread the study workload evenly across all available days from {current_date} to the day before {deadline}.\n"
    "2. Prioritize difficult, core, or fundamental concepts first, then move to easier, specialized, or review topics.\n"
    "3. Finish all study and review tasks before the deadline date.\n\n"
    "You MUST return the study plan in strict JSON format. The JSON object must contain a single key 'plan', "
    "which maps to a list of daily task objects.\n"
    "Each daily task object in the list must have exactly these keys:\n"
    "- 'date': The date of the study session in YYYY-MM-DD format (string)\n"
    "- 'task': The specific subtopic or study activity scheduled for that day (string)\n\n"
    "CRITICAL: Do NOT include any markdown formatting, do NOT wrap the response in markdown code blocks (such as ```json ... ```), "
    "do NOT provide any introductions, explanations, or additional text. Return ONLY the raw JSON object.\n\n"
    "Inputs:\n"
    "- Topic: {topic}\n"
    "- Deadline Date: {deadline}\n"
    "- Hours Per Day: {hours_per_day}\n"
    "- Current Date: {current_date}\n"
)

MENTOR_CHAT_USER_TEMPLATE = (
    "Retrieved notes context (use to answer if relevant):\n"
    "---------------------\n"
    "{context}\n"
    "---------------------\n\n"
    "Student's Message: {message}\n"
)
