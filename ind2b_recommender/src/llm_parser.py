
import os
import json
from litellm import completion
from dotenv import load_dotenv

# Setup paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY") 
ERROR_LOG_PATH = os.path.join(BASE_DIR, "parser_error.log")

SYSTEM_PROMPT = """
You are an expert agentic AI shopping assistant for 'ind2b'. 
Your goal is to parse user queries and conversation history into structured filters and agentic actions.

### Output Format (JSON):
{
  "intent": "search" | "recommend" | "compare" | "ask_clarification",
  "search_term": (string or null) - "Main product name (e.g., 'drill', 'laptop'). DO NOT include brand or price here if they fit in other fields.",
  "min_price": (float or null),
  "max_price": (float or null),
  "brand": (string or null) - "Brand name (e.g., 'Bosch', 'Apple', 'Endico')",
  "category": (string or null),
  "conversational_response": (string) - "A short, friendly message acknowledging the request (e.g., 'Looking for Bosch drills under 5k...')"
}

### Guidelines:
- **Brand Extraction**: ALWAYS move brand names (like Bosch, Endico, Taparia) from the query to the 'brand' field.
- **Refinement**: If the user provides a partial filter (e.g., "only red ones"), use context to complete the search term.
- **Ambiguity**: If the query is too vague, set intent to 'ask_clarification'.
- **Persistence**: Maintain values from the conversation history unless the user explicitly changes them. If they previously asked for "Bosch drills" and now say "under 500", the brand remains "Bosch" and the search_term remains "drill".
- **No Hallucinations**: Do NOT invent values. If a price isn't mentioned, leave it null. Do not add a min_price unless specified (e.g., 'between 100 and 500').

### Context Usage:
Analyze the history to maintain state. 
Example 1:
User: "show me some drills" -> {search_term: "drill"}
User: "only bosch" -> {search_term: "drill", brand: "Bosch"}
User: "under 500" -> {search_term: "drill", brand: "Bosch", max_price: 500}

Example 2:
User: "bosch drill" -> {search_term: "drill", brand: "Bosch"}
User: "under 500 rupee" -> {search_term: "drill", brand: "Bosch", max_price: 500}
"""

def parse_query_with_llm(query: str, history=None):
    """
    Uses Groq via LiteLLM to parse query with conversation history.
    """
    if not GROQ_API_KEY:
        print("ERROR: GROQ_API_KEY is not set!")
        return {"intent": "search", "search_term": query, "conversational_response": "Searching..."}

    try:
        if not query:
            return {"intent": "ask_clarification", "conversational_response": "How can I help you today?"}

        # Construct messages
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        if history:
            # history is expected to be list of {"role": "user"|"assistant", "content": "..."}
            # Limit history to last 4 turns for tokens/context
            messages.extend(history[-4:])
            
        messages.append({"role": "user", "content": f"{query}\n\nReturn the result as a raw JSON object."})

        response = completion(
            model="groq/llama-3.1-8b-instant", # Updated from decommissioned llama3-8b-8192
            messages=messages,
            api_key=GROQ_API_KEY,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        data = json.loads(content.strip())
        
        # Ensure fallback for missing keys
        defaults = {
            "intent": "search",
            "search_term": query,
            "min_price": None,
            "max_price": None,
            "brand": None,
            "category": None,
            "conversational_response": f"Searching for {query}..."
        }
        for k, v in defaults.items():
            if k not in data:
                data[k] = v
                
        return data

    except Exception as e:
        try:
            with open(ERROR_LOG_PATH, "a") as f:
                f.write(f"LLM Error: {str(e)}\n")
        except:
            pass
        print(f"LLM Parsing Error: {e}")
        return {
            "intent": "search",
            "search_term": query,
            "conversational_response": f"I'm looking into '{query}' for you..."
        }

if __name__ == "__main__":
    # Test
    print(parse_query_with_llm("I need a gaming laptop under 80000"))
