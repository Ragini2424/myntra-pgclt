# Myntra Bharat 🇮🇳

A hyper-local, AI-powered shopping experience tailored for every Indian city.

## 🚀 The AI Pipeline Explanation
Our system uses the Gemini API to act as the brain of the Myntra Bharat experience:
1. **Context Engine (/api/dashboard)**: Takes the user's city and state, and dynamically generates localized assets:
   - Regional greetings (e.g. Khama Ghani, Nomoshkar).
   - Localized themes (accent colors, hero images based on local architecture/culture).
   - Live festival detection (e.g. upcoming Ganesh Chaturthi in Maharashtra).
   - Pre-computed regional recommendation shelves based on popular local aesthetics.
2. **Hinglish Semantic Search (/api/search)**: Instead of keyword matching, the pipeline intercepts natural language (e.g. "Bhai ki shaadi ke liye kurta").
   - Intent & Occasion Detection: Recognizes "Wedding" and "Festive".
   - Weather & Location Context: Filters fabrics and styles based on live context (e.g. suggesting lightweight Bandhani in Rajasthan heat).
   - AI Ranking: Brand and style prioritization tailored to the user's explicit local intent.

## 📂 Folder Structure & Files Modified
- \`src/App.tsx\` (Modified): Core layout, orchestrates state for Location, Weather, and Dashboards.
- \`server.ts\` (New): Full-stack Express + Vite integration handling Gemini endpoints.
- \`src/components/LocationSelector.tsx\` (New): Auto-geolocation or manual fallback.
- \`src/components/SearchBar.tsx\` (New): Natural language input with loading states.
- \`src/components/ProductCard.tsx\` (New): Premium rendering of AI recommendations with reasoning badges.
- \`src/types.ts\` (New): Strict TS interfaces for our AI payloads.
- \`package.json\` (Modified): Added Express, cors, and build scripts for full-stack deployment.

## 🔌 APIs Used
- **Google Gemini API (gemini-2.5-flash)**: For NLP parsing, regional asset generation, and intent-based product ranking.
- **BigDataCloud Reverse Geocoding**: To convert browser coordinates into City/State data.


## 🛠️ Installation Instructions
\`\`\`bash
npm install
npm run dev
\`\`\`
The application starts a full-stack node process, wrapping Vite as middleware and serving standard API routes on the same port (3000).

