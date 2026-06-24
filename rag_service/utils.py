import os
import re
import json
import logging
from dotenv import load_dotenv
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("campusflow_utils")

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY environment variable is not set. All LLM-dependent endpoints will return HTTP 500.")


def call_groq(system_prompt: str, user_prompt: str) -> str:
    """
    Reusable helper to call the Groq API using the llama-3.1-8b-instant model
    with a temperature of 0.3. Handles API key checking and errors.
    """
    if not GROQ_API_KEY:
        raise ValueError("Groq API key is not configured. Please set the GROQ_API_KEY in your environment.")

    try:
        client = Groq(api_key=GROQ_API_KEY)
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )
        response_content = completion.choices[0].message.content
        if not response_content:
            raise ValueError("Groq returned an empty response.")
        return response_content.strip()
    except Exception as e:
        logger.error(f"Error calling Groq API: {str(e)}")
        raise RuntimeError(f"Groq API call failed: {str(e)}")


def parse_json_response(text: str):
    """
    Robustly extracts and parses JSON from LLM responses.
    Handles raw JSON, JSON wrapped in markdown code blocks, and minor conversational filler.
    Using strict=False allows control characters like raw newlines inside string values.
    """
    cleaned = text.strip()
    
    # 1. Try to parse directly
    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        pass

    # 2. Check for markdown code blocks (```json ... ``` or ``` ... ```)
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.DOTALL)
    if match:
        candidate = match.group(1).strip()
        try:
            return json.loads(candidate, strict=False)
        except json.JSONDecodeError:
            pass

    # 3. Search for the outermost JSON array [ ... ] or object { ... }
    match = re.search(r"(\[.*\]|\{.*\})", cleaned, re.DOTALL)
    if match:
        candidate = match.group(1).strip()
        try:
            return json.loads(candidate, strict=False)
        except json.JSONDecodeError as e:
            raise ValueError(f"Extracted JSON candidate was invalid: {e}")

    raise ValueError("Could not find or parse a valid JSON structure in the LLM response.")
