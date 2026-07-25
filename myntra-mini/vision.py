import os
import re
import json
import time
import base64
import requests
from dotenv import load_dotenv
from catalog import CATALOG

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")

AI_PROVIDER = os.environ.get("AI_PROVIDER", "groq" if GROQ_API_KEY else "anthropic")

if AI_PROVIDER == "groq":
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set.")
    client = None
    # Use OpenRouter's free vision models (see GROQ_MODELS fallback chain below)
    MODEL = "google/gemma-4-31b-it:free"
elif AI_PROVIDER == "gemini":
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    client = None
    MODEL = "gemini-2.0-flash"
else:
    if not ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY is not set.")
    from anthropic import Anthropic
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    MODEL = "claude-sonnet-4-6"


def download_twilio_media(media_url: str, account_sid: str, auth_token: str) -> bytes:
    resp = requests.get(media_url, auth=(account_sid, auth_token), timeout=15)
    resp.raise_for_status()
    return resp.content


def _fallback_attributes() -> dict:
    return {
        "category": "other", "gender": "unisex", "color": "", "pattern": "", "style": "", "occasion": ""
    }


def _normalize_groq_content(content: object) -> str:
    if isinstance(content, str): return content
    if isinstance(content, dict):
        if "text" in content and isinstance(content["text"], str): return content["text"]
        if "content" in content: return _normalize_groq_content(content["content"])
        return ""
    if isinstance(content, list):
        return "".join(_normalize_groq_content(item) for item in content)
    return str(content)


# Fallback chain of free OpenRouter vision models, tried in order if one is rate-limited (429)
GROQ_MODELS = [
    "google/gemma-4-31b-it:free",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
]


def _call_groq(prompt: str, image_bytes: bytes | None = None, media_type: str = "image/jpeg", image_url: str | None = None) -> str:
    # We are hijacking the Groq function to use OpenRouter's free tier
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "HTTP-Referer": "http://localhost:8000",
    }

    if image_bytes:
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        url_val = f"data:{media_type};base64,{b64_img}"
        image_block = {"type": "image_url", "image_url": {"url": url_val}}
    else:
        image_block = None

    message = {"role": "user", "content": [{"type": "text", "text": prompt}]}
    if image_block:
        message["content"].append(image_block)

    last_error = None
    for model in GROQ_MODELS:
        payload = {"model": model, "temperature": 0.2, "messages": [message]}

        # Pointing to OpenRouter instead of Groq
        resp = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=30)

        if resp.status_code == 429:
            last_error = f"{model} rate-limited"
            continue  # try next free model in the chain

        if not resp.ok:
            raise ValueError(f"OpenRouter request failed: {resp.text}")

        data = resp.json()
        return _normalize_groq_content(data["choices"][0]["message"]["content"])

    raise ValueError(f"All free OpenRouter models rate-limited (last: {last_error})")


def _call_gemini(prompt: str, image_bytes: bytes | None = None, media_type: str = "image/jpeg", max_retries: int = 2) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={GEMINI_API_KEY}"
    parts = [{"text": prompt}]
    if image_bytes:
        parts.append({
            "inline_data": {
                "mime_type": media_type,
                "data": base64.b64encode(image_bytes).decode("utf-8"),
            }
        })

    for attempt in range(max_retries + 1):
        resp = requests.post(url, json={"contents": [{"parts": parts}]}, timeout=30)
        if resp.status_code == 429:
            if attempt < max_retries:
                time.sleep(2 ** attempt)  # 1s, then 2s
                continue
            resp.raise_for_status()  # out of retries, surface the error
        resp.raise_for_status()
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"]


def analyze_image(image_bytes: bytes, media_type: str = "image/jpeg", image_url: str | None = None) -> dict:
    prompt = (
        "You are a fashion-cataloguing AI for an Indian e-commerce app. "
        "Look at this image. Identify the main clothing item and return ONLY a valid JSON object. "
        "CRITICAL: Do not include any explanations, greetings, or markdown formatting outside the JSON.\n"
        # --- UPDATE THIS LINE BELOW ---
        '{"category": one of ["ethnic wear", "western wear", "saree", "footwear", "accessories", "other"], '
        '"gender": one of ["women","men","unisex"], '
        '"color": dominant color as a single word, '
        '"pattern": one of ["solid","printed","floral","embroidered","checked","zari border","graphic print","other"], '
        '"style": one of ["ethnic","western","casual","streetwear","festive","other"], '
        '"occasion": one of ["casual","festive","party","other"]}'
    )

    try:
        if AI_PROVIDER == "groq":
            text = _call_groq(prompt, image_bytes=image_bytes, media_type=media_type)
        elif AI_PROVIDER == "gemini":
            text = _call_gemini(prompt, image_bytes=image_bytes, media_type=media_type)
        else:
            response = client.messages.create(
                model=MODEL,
                max_tokens=300,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": base64.b64encode(image_bytes).decode("utf-8")}},
                        {"type": "text", "text": prompt},
                    ],
                }],
            )
            text = "".join(b.text for b in response.content if b.type == "text").strip()
    except Exception as exc:
        print(f"[ERROR] Vision analysis failed: {exc}")
        return _fallback_attributes()

    text = text.replace("```json", "").replace("```", "").strip()
    if "</think>" in text: text = text.split("</think>")[-1]

    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match: text = json_match.group(0)

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return _fallback_attributes()

    # Some models occasionally wrap the object in a list, e.g. [{...}].
    # Guard against that so callers always get a dict.
    if isinstance(parsed, list):
        parsed = parsed[0] if parsed and isinstance(parsed[0], dict) else _fallback_attributes()

    if not isinstance(parsed, dict):
        return _fallback_attributes()

    return parsed


PRICE_CAP = 10000


def match_catalog(attributes: dict, top_n: int = 3) -> list:
    ai_cat = str(attributes.get("category", "")).lower().strip()
    ai_gender = str(attributes.get("gender", "")).lower().strip()
    ai_color = str(attributes.get("color", "")).lower().strip()
    ai_pattern = str(attributes.get("pattern", "")).lower().strip()
    ai_style = str(attributes.get("style", "")).lower().strip()

    # Step 1: Filter by price cap AND strict gender matching
    eligible = [
        item for item in CATALOG 
        if item.get("price", 0) <= PRICE_CAP 
        # Only allow items that match the requested gender, or are unisex
        and (not ai_gender or ai_gender == "unisex" or item.get("gender", "").lower() in [ai_gender, "unisex"])
    ]

    # Step 2: Strict Category Matching First
    category_matches = []
    if ai_cat and ai_cat != "other":
        category_matches = [
            item for item in eligible
            if ai_cat in item.get("category", "").lower() or item.get("category", "").lower() in ai_cat
        ]
    
    pool = category_matches if category_matches else eligible

    # Step 3: Score the pool
    scored = []
    for item in pool:
        score = 0
        cat_item = item.get("category", "").lower()
        color_item = item.get("color", "").lower()
        
        # We can remove the gender scoring here since we already strictly filtered it in Step 1!
        if ai_cat in cat_item or cat_item in ai_cat:
            score += 10
        if ai_color and (ai_color in color_item or color_item in ai_color):
            score += 4
        if ai_pattern and ai_pattern in item.get("pattern", "").lower():
            score += 2
        if ai_style and ai_style in item.get("style", "").lower():
            score += 1
            
        scored.append((score, item))

    scored.sort(key=lambda x: (-x[0], x[1]["price"]))
    top_matches = [item for _, item in scored[:top_n]]

    # Absolute fallback if pool was empty
    if not top_matches:
        top_matches = sorted(eligible, key=lambda i: i["price"])[:top_n]

    return top_matches

def detect_language(text: str) -> str:
    if not text: return "en"
    lowered = text.strip().lower()
    if lowered in ("english", "en"): return "en"
    if lowered in ("hindi", "hi"): return "hi"
    if lowered in ("tamil", "ta"): return "ta"
    if lowered in ("telugu", "te"): return "te"

    if any("\u0900" <= ch <= "\u097F" for ch in text): return "hi"
    if any("\u0B80" <= ch <= "\u0BFF" for ch in text): return "ta"
    if any("\u0C00" <= ch <= "\u0C7F" for ch in text): return "te"
    return "en"


def generate_reply(kind: str, language: str, **kwargs) -> str:
    lang = language if language in ("en", "hi", "ta", "te") else "en"

    if kind == "size_prompt":
        prompts = {
            "en": f"Great choice! You picked '{kwargs.get('product_name')}' for ₹{kwargs.get('price')}.\n\nPlease reply with your size (S, M, L, XL).",
            "hi": f"बेहतरीन पसंद! आपने '{kwargs.get('product_name')}' (₹{kwargs.get('price')}) चुना है।\n\nकृपया अपना साइज बताएं (S, M, L, XL).",
            "ta": f"சிறந்த தேர்வு! நீங்கள் '{kwargs.get('product_name')}' (₹{kwargs.get('price')}) ஐ தேர்ந்தெடுத்துள்ளீர்கள்.\n\nஉங்கள் அளவை (S, M, L, XL) பதிலளிக்கவும்.",
            "te": f"మంచి ఎంపిక! మీరు '{kwargs.get('product_name')}' (₹{kwargs.get('price')}) ఎంచుకున్నారు.\n\nదయచేసి మీ సైజు (S, M, L, XL) తో ప్రత్యుత్తరం ఇవ్వండి."
        }
        return prompts[lang]

    elif kind == "payment_prompt":
        prompts = {
            "en": f"Your order for '{kwargs.get('product_name')}' (Size: {kwargs.get('size')}) is ready!\n\nTotal: ₹{kwargs.get('price')}\nPay securely via UPI here: {kwargs.get('pay_link')}",
            "hi": f"आपका '{kwargs.get('product_name')}' (साइज: {kwargs.get('size')}) का ऑर्डर तैयार है!\n\nकुल: ₹{kwargs.get('price')}\nयहाँ UPI द्वारा सुरक्षित भुगतान करें: {kwargs.get('pay_link')}",
            "ta": f"உங்கள் '{kwargs.get('product_name')}' (அளவு: {kwargs.get('size')}) ஆர்டர் தயாராக உள்ளது!\n\nமொத்தம்: ₹{kwargs.get('price')}\nUPI மூலம் பாதுகாப்பாகச் செலுத்தவும்: {kwargs.get('pay_link')}",
            "te": f"మీ '{kwargs.get('product_name')}' (సైజు: {kwargs.get('size')}) ఆర్డర్ సిద్ధంగా ఉంది!\n\nమొత్తం: ₹{kwargs.get('price')}\nUPI ద్వారా సురక్షితంగా ఇక్కడ చెల్లించండి: {kwargs.get('pay_link')}"
        }
        return prompts[lang]

    elif kind == "order_confirmed":
        prompts = {
            "en": f"✅ Payment received! Order #{kwargs.get('order_id')} for '{kwargs.get('product_name')}' is confirmed. Tracking updates will appear here.",
            "hi": f"✅ भुगतान प्राप्त हुआ! '{kwargs.get('product_name')}' के लिए ऑर्डर #{kwargs.get('order_id')} की पुष्टि हो गई है।",
            "ta": f"✅ பணம் பெறப்பட்டது! '{kwargs.get('product_name')}' க்கான ஆர்டர் #{kwargs.get('order_id')} உறுதிப்படுத்தப்பட்டது.",
            "te": f"✅ చెల్లింపు స్వీకరించబడింది! '{kwargs.get('product_name')}' కోసం ఆర్డర్ #{kwargs.get('order_id')} నిర్ధారించబడింది."
        }
        return prompts[lang]

    elif kind == "shipped":
        prompts = {
            "en": f"📦 Update: Your order #{kwargs.get('order_id')} has been shipped!",
            "hi": f"📦 अपडेट: आपका ऑर्डर #{kwargs.get('order_id')} भेज दिया गया है!",
            "ta": f"📦 புதுப்பிப்பு: உங்கள் ஆர்டர் #{kwargs.get('order_id')} அனுப்பப்பட்டது!",
            "te": f"📦 అప్‌డేట్: మీ ఆర్డర్ #{kwargs.get('order_id')} రవాణా చేయబడింది!"
        }
        return prompts[lang]

    elif kind == "out_for_delivery":
        prompts = {
            "en": f"🚚 Update: Your order #{kwargs.get('order_id')} is out for delivery today!",
            "hi": f"🚚 अपडेट: आपका ऑर्डर #{kwargs.get('order_id')} आज डिलीवरी के लिए निकल चुका है!",
            "ta": f"🚚 புதுப்பிப்பு: உங்கள் ஆர்டர் #{kwargs.get('order_id')} டெலிவரிக்கு வந்துவிட்டது!",
            "te": f"🚚 అప్‌డేట్: మీ ఆర్డర్ #{kwargs.get('order_id')} డెలివరీ కోసం బయలుదేరింది!"
        }
        return prompts[lang]

    elif kind == "delivered":
        prompts = {
            "en": f"🎁 Delivered! Your order #{kwargs.get('order_id')} has arrived. Hope you love it!",
            "hi": f"🎁 डिलीवर हो गया! आपका ऑर्डर #{kwargs.get('order_id')} पहुँच गया है।",
            "ta": f"🎁 வழங்கப்பட்டது! உங்கள் ஆர்டர் #{kwargs.get('order_id')} வந்துவிட்டது.",
            "te": f"🎁 డెలివరీ చేయబడింది! మీ ఆర్డర్ #{kwargs.get('order_id')} వచ్చింది."
        }
        return prompts[lang]

    elif kind == "app_download_nudge":
        prompts = {
            "en": "📱 Want ₹100 off your next order? Download the full Myntra app here: https://myntra.app.link/download",
            "hi": "📱 अगले ऑर्डर पर ₹100 की छूट चाहिए? Myntra ऐप डाउनलोड करें: https://myntra.app.link/download",
            "ta": "📱 அடுத்த ஆர்டரில் ₹100 தள்ளுபடி வேண்டுமா? Myntra பயன்பாட்டைப் பதிவிறக்கவும்: https://myntra.app.link/download",
            "te": "📱 తదుపరి ఆర్డర్‌పై ₹100 తగ్గింపు కావాలా? Myntra యాప్‌ని డౌన్‌లోడ్ చేయండి: https://myntra.app.link/download"
        }
        return prompts[lang]

    elif kind == "invalid_size":
        prompts = {
            "en": "Please reply with a valid size (S, M, L, or XL).",
            "hi": "कृपया मान्य साइज (S, M, L, या XL) में जवाब दें।",
            "ta": "சரியான அளவுடன் (S, M, L, அல்லது XL) பதிலளிக்கவும்.",
            "te": "దయచేసి సరైన సైజు (S, M, L, లేదా XL) తో రిప్లై ఇవ్వండి."
        }
        return prompts[lang]

    elif kind == "invalid_input":
        prompts = {
            "en": "Please reply with just 1, 2, or 3 to choose a product.",
            "hi": "उत्पाद चुनने के लिए केवल 1, 2, या 3 लिखकर जवाब दें।",
            "ta": "தயாரிப்பைத் தேர்ந்தெடுக்க 1, 2, அல்லது 3 என்று மட்டும் பதிலளிக்கவும்.",
            "te": "దయచేసి ఒక ఉత్పత్తిని ఎంచుకోవడానికి 1, 2, లేదా 3 తో మాత్రమే సమాధానం ఇవ్వండి."
        }
        return prompts[lang]

    elif kind == "no_match":
        prompts = {
            "en": "Sorry, I couldn't find a close match . Please try sending another photo!",
            "hi": "माफ़ करें, मुझे ₹1500 के अंदर कोई करीबी मैच नहीं मिला। कृपया दूसरी फोटो भेजें!",
            "ta": "மன்னிக்கவும், ₹1500-க்குள் என்னால் பொருத்தமான ஒன்றைக் கண்டுபிடிக்க முடியவில்லை. வேறு படங்களை அனுப்பவும்!",
            "te": "క్షమించండి, ₹1500 లోపు నాకు సరైన మ్యాచ్ దొరకలేదు. దయచేసి మరొక ఫోటో పంపండి!"
        }
        return prompts[lang]

    return prompts.get("en", "An error occurred, please try again.")
