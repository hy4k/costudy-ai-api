import os
import openai
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env
openai.api_key = os.getenv("OPENAI_API_KEY")

try:
    response = openai.Model.list()
    print("API is working! Available models:")
    for model in response["data"]:
        print(model["id"])
except Exception as e:
    print("Error calling OpenAI API:", e)