import os
import re
import uuid
import threading
import time
import json
from flask import Flask, request, render_template, jsonify, send_file
from io import BytesIO
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client as TwilioClient
from dotenv import load_dotenv

load_dotenv(override=True)
from vision import download_twilio_media, analyze_image, match_catalog, generate_reply, detect_language
from catalog import CATALOG

app = Flask(__name__)
PUBLIC_BASE_URL="https://barbell-eccentric-shock.ngrok-free.dev"
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.environ.get("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://localhost:8000").strip().rstrip("/")

twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID else None

# ==========================================
# PERSISTENT DATABASE (Fixes the Amnesia Bug)
# ==========================================
DB_FILE = "myntra_mini_db.json"

def load_db():
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"sessions": {}, "orders": {}}

def save_db(db_state):
    try:
        with open(DB_FILE, "w") as f:
            json.dump(db_state, f)
    except Exception as e:
        print(f"[WARN] Failed to save DB: {e}")

db = load_db()
SESSIONS = db.get("sessions", {})
ORDERS = db.get("orders", {})
IMAGE_STORE = {} # Ephemeral image store for Groq

def get_session(phone):
    if phone not in SESSIONS:
        SESSIONS[phone] = {"state": "AWAITING_IMAGE", "language": "en"}
    return SESSIONS[phone]

@app.after_request
def persist_state(response):
    """Saves the session state to a file after every WhatsApp message."""
    save_db({"sessions": SESSIONS, "orders": ORDERS})
    return response

# ==========================================
# BACKGROUND WORKERS
# ==========================================
def send_whatsapp(to_phone, body):
    if not twilio_client:
        print(f"[DRY RUN -> {to_phone}] {body}")
        return
    twilio_client.messages.create(from_=TWILIO_WHATSAPP_NUMBER, to=to_phone, body=body)

def cleanup_old_images():
    while True:
        time.sleep(60) 
        now = time.time()
        stale = [img_id for img_id, data in IMAGE_STORE.items() if now - data["created_at"] > 300]
        for img_id in stale:
            del IMAGE_STORE[img_id]

def run_tracking_sequence(phone, order_id):
    order = ORDERS[order_id]
    lang = order["language"]
    time.sleep(15)
    send_whatsapp(phone, generate_reply("shipped", lang, order_id=order_id))
    time.sleep(20)
    send_whatsapp(phone, generate_reply("out_for_delivery", lang, order_id=order_id))
    time.sleep(20)
    send_whatsapp(phone, generate_reply("delivered", lang, order_id=order_id))
    time.sleep(3)
    send_whatsapp(phone, generate_reply("app_download_nudge", lang))

# ==========================================
# ROUTES
# ==========================================
@app.route("/image/<image_id>", methods=["GET"])
def serve_image(image_id):
    if image_id not in IMAGE_STORE:
        return "Image not found", 404
    img_data = IMAGE_STORE[image_id]
    return send_file(BytesIO(img_data["bytes"]), mimetype=img_data["media_type"], as_attachment=False)

@app.route("/webhook/whatsapp", methods=["POST"])
def whatsapp_webhook():
    from_number = request.values.get("From", "")
    body = (request.values.get("Body") or "").strip()
    num_media = int(request.values.get("NumMedia", 0))
    
    session = get_session(from_number)
    resp = MessagingResponse()

    # Handle Language Overrides Gracefully
    if body.lower() in ("english", "hindi", "tamil", "telugu"):
        session["language"] = detect_language(body)
        resp.message(f"✅ Language updated! Please continue with your current step.")
        return str(resp), 200, {"Content-Type": "application/xml"}

    # 1. Image received -> Vision & Match
    if num_media > 0 and session["state"] in ("AWAITING_IMAGE", "AWAITING_SELECTION"):
        media_url = request.values.get("MediaUrl0")
        media_type = request.values.get("MediaContentType0", "image/jpeg")
        
        if body:
            session["language"] = detect_language(body)

        try:
            image_bytes = download_twilio_media(media_url, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            image_id = uuid.uuid4().hex
            IMAGE_STORE[image_id] = {"bytes": image_bytes, "media_type": media_type, "created_at": time.time()}
            image_url = f"{PUBLIC_BASE_URL}/image/{image_id}"
            
            attributes = analyze_image(image_bytes, media_type, image_url=image_url)
            matches = match_catalog(attributes, top_n=3)
        except Exception as e:
            print(f"[ERROR] Vision pipeline failed: {e}")
            matches = []

        if not matches:
            reply = generate_reply("no_match", session["language"])
            resp.message(reply)
            session["state"] = "AWAITING_IMAGE"
            return str(resp), 200, {"Content-Type": "application/xml"}

        session["matches"] = matches
        session["state"] = "AWAITING_SELECTION"
        
        for idx, match in enumerate(matches):
            item_num = idx + 1
            caption = f"Option {item_num}: {match['name']}\n₹{match['price']}"
            img_url = match.get("image_url")
            
            if img_url and img_url.startswith("http"):
                twilio_client.messages.create(from_=TWILIO_WHATSAPP_NUMBER, to=from_number, body=caption, media_url=[img_url])
            else:
                twilio_client.messages.create(from_=TWILIO_WHATSAPP_NUMBER, to=from_number, body=caption)
            time.sleep(1)   

        final_prompts = {
            "en": "Which one do you like? Reply with 1, 2, or 3 to choose!",
            "hi": "आपको कौन सा पसंद है? चुनने के लिए 1, 2, या 3 लिखकर जवाब दें!",
            "ta": "உங்களுக்கு எது பிடிக்கும்? தேர்வு செய்ய 1, 2 அல்லது 3 என பதிலளிக்கவும்!",
            "te": "మీకు ఏది ఇష్టం? ఎంచుకోవడానికి 1, 2 లేదా 3 తో రిప్లై ఇవ్వండి!"
        }
        resp.message(final_prompts.get(session["language"], final_prompts["en"]))
        return str(resp), 200, {"Content-Type": "application/xml"}

    # 2. User Picks Product
    if session["state"] == "AWAITING_SELECTION":
        num_match = re.search(r'\d+', body)
        if num_match and num_match.group(0) in ("1", "2", "3"):
            idx = int(num_match.group(0)) - 1
            matches = session.get("matches", [])
            
            if idx < len(matches):
                session["selected"] = matches[idx]
                session["state"] = "AWAITING_SIZE"
                
                reply_text = generate_reply(
                    "size_prompt", session["language"],
                    product_name=session["selected"]["name"], price=session["selected"]["price"]
                )
                resp.message(reply_text)
                return str(resp), 200, {"Content-Type": "application/xml"}
                
        resp.message(generate_reply("invalid_input", session["language"]))
        return str(resp), 200, {"Content-Type": "application/xml"}

    # 3. User Selects Size -> Generate Payment Link
    if session["state"] == "AWAITING_SIZE":
        size = body.strip().upper()
        if size not in ("S", "M", "L", "XL"):
            resp.message(generate_reply("invalid_size", session["language"]))
            return str(resp), 200, {"Content-Type": "application/xml"}
            
        product = session["selected"]
        order_id = uuid.uuid4().hex[:8].upper()

        ORDERS[order_id] = {
            "phone": from_number,
            "language": session["language"],
            "product": product,
            "size": size,
            "status": "AWAITING_PAYMENT"
        }
        session["state"] = "AWAITING_PAYMENT"
        
        pay_link = f"{PUBLIC_BASE_URL}/pay/{order_id}"
        reply_text = generate_reply(
            "payment_prompt", 
            session["language"],
            product_name=product["name"], 
            size=size, 
            price=product["price"],
            pay_link=pay_link
        )
        resp.message(reply_text)
        return str(resp), 200, {"Content-Type": "application/xml"}

    # 4. Fallback / Entry Point
    session["state"] = "AWAITING_IMAGE"
    resp.message(
        "🛍️ *Myntra Mini*\n"
        "Forward a photo/screenshot of any outfit you like, and I'll find similar items under ₹1500 for you.\n\n"
        "_(Reply 'English'/'Hindi'/'Tamil'/'Telugu' anytime to switch language.)_"
    )
    return str(resp), 200, {"Content-Type": "application/xml"}

@app.route("/pay/<order_id>", methods=["GET"])
def pay_page(order_id):
    order = ORDERS.get(order_id)
    if not order:
        return "Order not found", 404
    return render_template("pay.html", order=order, order_id=order_id)

@app.route("/pay/<order_id>/confirm", methods=["POST"])
def confirm_payment(order_id):
    order = ORDERS.get(order_id)
    if not order:
        return jsonify({"error": "not found"}), 404
    
    order["status"] = "PAID"
    phone = order["phone"]
    lang = order["language"]
    product = order["product"]
    
    send_whatsapp(phone, generate_reply(
        "order_confirmed", lang,
        order_id=order_id, product_name=product["name"], size=order["size"], price=product["price"],
    ))
    
    session = get_session(phone)
    session["state"] = "AWAITING_IMAGE"
    
    threading.Thread(target=run_tracking_sequence, args=(phone, order_id), daemon=True).start()
    return jsonify({"status": "ok"})

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "Myntra Mini running", "sessions_tracked": len(SESSIONS)})

if __name__ == "__main__":
    print("Running file:", __file__)
    print("PORT env:", os.environ.get("PORT"))
    cleanup_thread = threading.Thread(target=cleanup_old_images, daemon=True)
    cleanup_thread.start()
    app.run(debug=False, port=int(os.environ.get("PORT", 8000)))