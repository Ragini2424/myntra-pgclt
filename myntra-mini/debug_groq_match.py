import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GROQ_API_KEY")
if not key:
    raise SystemExit("Missing GROQ_API_KEY")

matches = [
    {
        "name": "Printed Wrap Dress - Red",
        "price": 749,
        "image_url": "https://placehold.co/400x600/c0392b/fff?text=Red+Wrap+Dress",
    },
    {
        "name": "Floral Fit & Flare Dress - Pink",
        "price": 899,
        "image_url": "https://placehold.co/400x600/e88bc0/222?text=Pink+Floral+Dress",
    },
    {
        "name": "Embroidered Kurti - Maroon",
        "price": 1199,
        "image_url": "https://placehold.co/400x600/7a2333/fff?text=Maroon+Embroidered+Kurti",
    },
]

instruction = (
    "Write a very concise, WhatsApp-friendly message presenting these 3 product matches as a numbered list "
    "(1, 2, 3). For each: name, price in rupees (₹), and one short appealing phrase. "
    "Ask the user to reply with 1, 2, or 3 to choose. Keep it under 80 words total, with no extra analysis or reasoning. "
    "Mention that product images are attached.\n\n"
    f"Products: {json.dumps(matches)}"
)

prompt = (
    "You are Myntra Mini, a friendly WhatsApp shopping assistant for small-town India. "
    f"Reply ONLY in English. Do not include English translation. No markdown, no emojis-overload (1-2 max is fine). Just the message text, nothing else.\n\n{instruction}"
)

print('PROMPT=')
print(prompt)
print('---')

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {"Authorization": f"Bearer {key}"}
payload = {
    "model": "qwen/qwen3.6-27b",
    "temperature": 0.2,
    "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}],
}

resp = requests.post(url, headers=headers, json=payload, timeout=60)
print('STATUS', resp.status_code)
print(resp.text)
