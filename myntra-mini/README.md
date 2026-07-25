# Myntra Mini — WhatsApp-Native Commerce Loop

A hackathon-ready, **actually functional** demo of the "screenshot → WhatsApp → AI match → in-chat
checkout" flow, built on the real Twilio WhatsApp Sandbox and Claude's vision API.

## What's real vs. simulated

| Piece | Status |
|---|---|
| WhatsApp messaging | **Real** — runs on Twilio's actual WhatsApp Sandbox |
| Image → product matching | **Real AI** — Claude Vision analyzes the forwarded screenshot and a scoring engine ranks catalog items |
| Multilingual replies | **Real** — Claude generates the reply text natively in Hindi / Tamil / Telugu / English |
| Size selection, order flow | **Real** — text-based state machine over WhatsApp |
| UPI payment | **Simulated** — a hosted mock checkout page (real UPI needs an approved payment aggregator + business KYC, not feasible in a hackathon window) |
| Delivery tracking | **Simulated** — timed WhatsApp messages (15s/20s/20s after payment) standing in for courier webhooks |

## Setup (10 minutes)

### 1. Install dependencies
```bash
cd myntra-mini
python -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
```

### 2. Get your keys
- **Groq API key**: https://console.groq.com/keys
- **Anthropic API key** (optional fallback): https://console.anthropic.com/
- **Twilio account**: https://www.twilio.com/try-twilio (free trial works fine)
  - In the Twilio Console, go to **Messaging → Try it out → Send a WhatsApp message**
  - This gives you a Sandbox number (usually `whatsapp:+14155238886`) and a join code like `join happy-tiger`

### 3. Configure environment
```bash
cp .env.example .env
# fill in ANTHROPIC_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
```

### 4. Expose your local server
```bash
# in one terminal
python app.py

# in another terminal
ngrok http 5000
```
Copy the `https://xxxx.ngrok-free.app` URL ngrok gives you and paste it into `.env` as `PUBLIC_BASE_URL`
(restart `app.py` after editing `.env`).

### 5. Wire up the Twilio Sandbox webhook
In the Twilio Console → **Messaging → Try it out → WhatsApp sandbox settings**:
- **"WHEN A MESSAGE COMES IN"** → `https://xxxx.ngrok-free.app/webhook/whatsapp` (POST)

### 6. Join the sandbox from your phone
On WhatsApp, message the Twilio sandbox number with the join code (e.g. `join happy-tiger`).

## Demo script (what to show the judges)

1. **Show the problem first**: open Instagram Reels, screenshot an outfit.
2. **Forward the screenshot** to the Twilio WhatsApp number.
3. Within seconds, get back **3 real AI-matched products** under ₹1500, in Hindi by default
   (say "English" any time to switch language and show the multilingual capability live).
4. **Reply "1"** → bot asks for size.
5. **Reply "M"** → bot sends a real payment link.
6. **Tap the link**, show the mock UPI checkout page, **tap Pay**.
7. Back in WhatsApp: order confirmation appears instantly, then **shipped / out for delivery /
   delivered** pings roll in over the next ~55 seconds (sped up for demo purposes — frame this
   explicitly as "in production these are triggered by real courier webhooks, here we're
   simulating the exact same message sequence on a timer").
8. Final message: **the app-download nudge with the ₹100 credit** — this is the punchline slide:
   *"We earned the trust and delivered value first. Now — and only now — we ask for the app
   download."*

## Architecture notes for your slides

- `app.py` — Flask app, Twilio webhook, conversation state machine, mock payment routes
- `vision.py` — Claude Vision image analysis, catalog scoring/matching, multilingual copy generation
- `catalog.py` — demo product catalog (12 SKUs, swap for a real Myntra inventory API in production)
- `templates/pay.html` — mock UPI checkout page

State machine per user (in-memory dict, keyed by phone number):
```
AWAITING_IMAGE → AWAITING_SELECTION → AWAITING_SIZE → AWAITING_PAYMENT → (reset) AWAITING_IMAGE
```

## What you'd need for a real production version

- WhatsApp Business API (not Sandbox) + approved message templates for native carousel/button UI
- An approved UPI payment aggregator (Razorpay/PayU/Cashfree) with business KYC
- Real courier tracking webhooks instead of the timed simulation
- Persistent session store (Redis) instead of the in-memory dict
- A real product/inventory API instead of the static catalog
