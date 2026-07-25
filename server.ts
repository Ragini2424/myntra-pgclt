import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// In-memory server caches
const cityCache = new Map<string, { city: string; state: string }>();
const editorialCache = new Map<string, {
  festivals: Array<{ name: string; dateRange: string; culturalNote: string }>;
  headline: string;
  subtext: string;
  userDate: string;
  isQuotaFallback?: boolean;
}>();

// Expanded Dictionary covering 120+ Tier 1, Tier 2, and Tier 3 Indian Cities & Towns to State mapping
const FALLBACK_CITY_TO_STATE: Record<string, string> = {
  // PUNJAB & HARYANA
  'patiala': 'Punjab',
  'bathinda': 'Punjab',
  'hoshiarpur': 'Punjab',
  'amritsar': 'Punjab',
  'ludhiana': 'Punjab',
  'chandigarh': 'Punjab',
  'jalandhar': 'Punjab',
  'mojali': 'Punjab',
  'pathankot': 'Punjab',
  'firozpur': 'Punjab',
  'gurgaon': 'Haryana',
  'gurugram': 'Haryana',
  'faridabad': 'Haryana',
  'panipat': 'Haryana',
  'karnal': 'Haryana',
  'rohtak': 'Haryana',
  'hisar': 'Haryana',
  'ambala': 'Haryana',

  // BIHAR & JHARKHAND
  'patna': 'Bihar',
  'gaya': 'Bihar',
  'muzaffarpur': 'Bihar',
  'bhagalpur': 'Bihar',
  'darbhanga': 'Bihar',
  'purnia': 'Bihar',
  'begusarai': 'Bihar',
  'katihar': 'Bihar',
  'arrah': 'Bihar',
  'chhapra': 'Bihar',
  'munger': 'Bihar',
  'ranchi': 'Jharkhand',
  'jamshedpur': 'Jharkhand',
  'dhanbad': 'Jharkhand',
  'bokaro': 'Jharkhand',
  'deoghar': 'Jharkhand',

  // WEST BENGAL & EAST
  'kolkata': 'West Bengal',
  'siliguri': 'West Bengal',
  'howrah': 'West Bengal',
  'durgapur': 'West Bengal',
  'asansol': 'West Bengal',
  'bardhaman': 'West Bengal',
  'malda': 'West Bengal',
  'kharagpur': 'West Bengal',
  'bhubaneswar': 'Odisha',
  'cuttack': 'Odisha',
  'rourkela': 'Odisha',
  'puri': 'Odisha',
  'sambalpur': 'Odisha',

  // UTTAR PRADESH & UTTARAKHAND
  'lucknow': 'Uttar Pradesh',
  'kanpur': 'Uttar Pradesh',
  'varanasi': 'Uttar Pradesh',
  'agra': 'Uttar Pradesh',
  'noida': 'Uttar Pradesh',
  'prayagraj': 'Uttar Pradesh',
  'ghaziabad': 'Uttar Pradesh',
  'gorakhpur': 'Uttar Pradesh',
  'bareilly': 'Uttar Pradesh',
  'meerut': 'Uttar Pradesh',
  'mathura': 'Uttar Pradesh',
  'aligarh': 'Uttar Pradesh',
  'moradabad': 'Uttar Pradesh',
  'saharanpur': 'Uttar Pradesh',
  'jhansi': 'Uttar Pradesh',
  'ayodhya': 'Uttar Pradesh',
  'faizabad': 'Uttar Pradesh',
  'dehradun': 'Uttarakhand',
  'haridwar': 'Uttarakhand',
  'rishikesh': 'Uttarakhand',
  'haldwani': 'Uttarakhand',

  // RAJASTHAN
  'jaipur': 'Rajasthan',
  'jodhpur': 'Rajasthan',
  'udaipur': 'Rajasthan',
  'kota': 'Rajasthan',
  'ajmer': 'Rajasthan',
  'bikaner': 'Rajasthan',
  'alwar': 'Rajasthan',
  'bhilwara': 'Rajasthan',

  // MAHARASHTRA & GOA
  'mumbai': 'Maharashtra',
  'pune': 'Maharashtra',
  'nagpur': 'Maharashtra',
  'nashik': 'Maharashtra',
  'kolhapur': 'Maharashtra',
  'thane': 'Maharashtra',
  'solapur': 'Maharashtra',
  'amravati': 'Maharashtra',
  'nanded': 'Maharashtra',
  'sangli': 'Maharashtra',
  'jalgaon': 'Maharashtra',
  'akola': 'Maharashtra',
  'latur': 'Maharashtra',
  'panaji': 'Goa',
  'margao': 'Goa',

  // TELANGANA & ANDHRA PRADESH
  'warangal': 'Telangana',
  'hyderabad': 'Telangana',
  'khammam': 'Telangana',
  'karimnagar': 'Telangana',
  'nizamabad': 'Telangana',
  'visakhapatnam': 'Andhra Pradesh',
  'vijayawada': 'Andhra Pradesh',
  'tirupati': 'Andhra Pradesh',
  'guntur': 'Andhra Pradesh',
  'kakinada': 'Andhra Pradesh',
  'rajahmundry': 'Andhra Pradesh',
  'nellore': 'Andhra Pradesh',

  // KARNATAKA, TAMIL NADU & KERALA
  'bengaluru': 'Karnataka',
  'bangalore': 'Karnataka',
  'mysore': 'Karnataka',
  'hubli': 'Karnataka',
  'mangalore': 'Karnataka',
  'shimoga': 'Karnataka',
  'tumkur': 'Karnataka',
  'bellary': 'Karnataka',
  'chennai': 'Tamil Nadu',
  'madurai': 'Tamil Nadu',
  'coimbatore': 'Tamil Nadu',
  'salem': 'Tamil Nadu',
  'trichy': 'Tamil Nadu',
  'tiruchirappalli': 'Tamil Nadu',
  'tirunelveli': 'Tamil Nadu',
  'vellore': 'Tamil Nadu',
  'erode': 'Tamil Nadu',
  'kochi': 'Kerala',
  'cochin': 'Kerala',
  'thiruvananthapuram': 'Kerala',
  'trivandrum': 'Kerala',
  'kozhikode': 'Kerala',
  'thrissur': 'Kerala',
  'kollam': 'Kerala',
  'alappuzha': 'Kerala',
  'palakkad': 'Kerala',
  'kannur': 'Kerala',

  // GUJARAT & MADHYA PRADESH
  'ahmedabad': 'Gujarat',
  'surat': 'Gujarat',
  'vadodara': 'Gujarat',
  'rajkot': 'Gujarat',
  'bhavnagar': 'Gujarat',
  'jamnagar': 'Gujarat',
  'indore': 'Madhya Pradesh',
  'bhopal': 'Madhya Pradesh',
  'gwalior': 'Madhya Pradesh',
  'jabalpur': 'Madhya Pradesh',
  'ujjain': 'Madhya Pradesh',
  'raipur': 'Chhattisgarh',
  'bilaspur': 'Chhattisgarh',
  'bhilai': 'Chhattisgarh',

  // ASSAM & NORTH EAST
  'guwahati': 'Assam',
  'silchar': 'Assam',
  'shillong': 'Meghalaya',
  'imphal': 'Manipur',
  'agartala': 'Tripura',
  'aizawl': 'Mizoram',
  'kohima': 'Nagaland',
  'gangtok': 'Sikkim',

  // NORTH METROS
  'delhi': 'Delhi',
  'new delhi': 'Delhi',
  'shimla': 'Himachal Pradesh',
  'srinagar': 'Jammu & Kashmir',
  'jammu': 'Jammu & Kashmir',
};

// Regional 60-day festival provider
function getQuotaFallbackEditorial(city: string, state: string, userDateStr: string) {
  const stateFestivalsMap: Record<string, Array<{ name: string; dateRange: string; culturalNote: string }>> = {
    'Punjab': [
      {
        name: 'Teej & Baisakhi Celebrations',
        dateRange: 'August 12 - August 28',
        culturalNote: 'Bright Phulkari embroidered dupattas, Patiala salwar suits, and hand-stitched Punjabi juttis.'
      },
      {
        name: 'Lohri & Shaadi Wedding Season',
        dateRange: 'October 15 - November 30',
        culturalNote: 'Royal Patiala suits, heavy zari sherwanis, and festive knitwear across Punjab.'
      }
    ],
    'Bihar': [
      {
        name: 'Hariyali & Kajari Teej',
        dateRange: 'August 14 - August 18',
        culturalNote: 'Women adorn vibrant green and red silk sarees with traditional gold jewelry and mehendi.'
      },
      {
        name: 'Chhath Puja & Festival Preparations',
        dateRange: 'October 25 - November 5',
        culturalNote: 'Traditional Tussar silk sarees and embroidered kurtas celebrating Mithila heritage.'
      }
    ],
    'Uttar Pradesh': [
      {
        name: 'Lucknow Mahotsav & Raksha Bandhan',
        dateRange: 'August 15 - August 28',
        culturalNote: 'Elegant Lucknowi Chikankari kurtas and pastel ethnic suits decorated with intricate zardozi.'
      }
    ],
    'West Bengal': [
      {
        name: 'Durga Puja Showcase',
        dateRange: 'September 15 - October 15',
        culturalNote: 'Brisk shopping season for red-bordered Garad silks, designer ethnic drapes, and festive footwear.'
      }
    ],
    'Maharashtra': [
      {
        name: 'Ganesh Chaturthi Utsav',
        dateRange: 'September 12 - September 22',
        culturalNote: 'Rich Paithani sarees, Nauvari drapes, and silk dhotis celebrating Lord Ganesha.'
      }
    ]
  };

  const defaultFestivals = [
    {
      name: 'Festive Season & Cultural Celebrations',
      dateRange: 'Upcoming Festival Window',
      culturalNote: `Vibrant festive ethnic wear and traditional attire tailored for celebrations across ${state}.`
    }
  ];

  const festivals = stateFestivalsMap[state] || defaultFestivals;

  let headline = `${city}'s Regional Festive & Cultural Edit`;
  let subtext = `Curated festive silks, hand-embroidered ethnic wear, and festive footwear tailored for upcoming celebrations in ${city}, ${state}.`;

  if (state === 'Punjab') {
    headline = `${city}'s Royal Phulkari & Patiala Festive Edit`;
    subtext = `Vibrant Phulkari dupattas, embellished Patiala salwar suits, and hand-stitched juttis for Punjab's festive pulse in ${city}.`;
  } else if (state === 'Bihar') {
    headline = `${city}'s Chhath Puja & Teej Festive Edit`;
    subtext = `Discover opulent Tussar silks, hand-embroidered kurtas, and traditional zardozi sarees tailored for Bihar's sacred Chhath & Teej pujas in ${city}.`;
  } else if (state === 'Uttar Pradesh') {
    headline = `${city}'s Royal Lucknowi Chikankari & Festive Storefront`;
    subtext = `Exquisite Chikankari kurtas, handloom Banarasi silk sarees, and embellished ethnic footwear curated for celebrations across ${city}.`;
  }

  return {
    festivals,
    headline,
    subtext,
    userDate: userDateStr,
    isQuotaFallback: true
  };
}

// Retry helper for Gemini API
async function generateContentWithRetry(prompt: string, schema?: any) {
  try {
    const config: any = {
      responseMimeType: "application/json"
    };
    if (schema) {
      config.responseSchema = schema;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config
    });
    return response.text;
  } catch (err: any) {
    if ((err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED"))) {
      console.log("Gemini API rate limit reached. Using curated fallback parser.");
      throw err;
    }
    throw err;
  }
}

// Multilingual Script Translation & Fallback Hinglish/Indian Query Parser
function parseMultilingualRuleBased(query: string) {
  const q = query.toLowerCase().trim();
  
  // Category detection across scripts (Hindi, Punjabi, Bengali, Tamil, Telugu, Marathi, Gujarati)
  let category: string | null = null;
  if (
    q.includes('kurta') || q.includes('kurti') || q.includes('saree') || q.includes('sari') || 
    q.includes('suit') || q.includes('ethnic') || q.includes('lehenga') || q.includes('anarkali') || 
    q.includes('dhoti') || q.includes('sherwani') || q.includes('dupatta') || q.includes('veshti') ||
    q.includes('कुर्ता') || q.includes('कुर्ती') || q.includes('साड़ी') || q.includes('साडी') || 
    q.includes('लहंगा') || q.includes('शेरवानी') || q.includes('दुपट्टा') ||
    q.includes('ਕੁਰਤਾ') || q.includes('ਸੂਟ') || q.includes('ਸਲਵਾਰ') ||
    q.includes('পাঞ্জাবি') || q.includes('শাড়ি') || q.includes('লেহেঙ্গা') ||
    q.includes('குர்தா') || q.includes('புடவை') || q.includes('வேஷ்டி') ||
    q.includes('కుర్తా') || q.includes('చీర') ||
    q.includes('સાડી') || q.includes('ચણિયા ચોળી')
  ) {
    category = 'ethnic wear';
  } else if (
    q.includes('shirt') || q.includes('pant') || q.includes('jeans') || q.includes('dress') || 
    q.includes('western') || q.includes('blazer') || q.includes('tee') || q.includes('top') || 
    q.includes('jacket') || q.includes('शर्ट') || q.includes('जींस') || q.includes('ड्रेस') || q.includes('जैकेट')
  ) {
    category = 'western wear';
  } else if (
    q.includes('shoe') || q.includes('sneaker') || q.includes('jutti') || q.includes('heel') || 
    q.includes('sandal') || q.includes('footwear') || q.includes('mojari') || q.includes('chappal') || 
    q.includes('kolhapuri') || q.includes('जूता') || q.includes('जूती') || q.includes('ਚੱਪਲ') || 
    q.includes('ਜੁੱਤੀ') || q.includes('சப்பல்') || q.includes('చెప్పులు')
  ) {
    category = 'footwear';
  } else if (
    q.includes('watch') || q.includes('bag') || q.includes('jewelry') || q.includes('necklace') || 
    q.includes('earring') || q.includes('jhumka') || q.includes('accessory') || q.includes('potli') || 
    q.includes('घड़ी') || q.includes('बैग') || q.includes('झुमका') || q.includes('ਗਹਿਣੇ')
  ) {
    category = 'accessories';
  }

  // Occasion detection
  let occasion: string | null = null;
  if (
    q.includes('shaadi') || q.includes('shadi') || q.includes('wedding') || q.includes('sangeet') || 
    q.includes('groom') || q.includes('bride') || q.includes('haldi') || q.includes('शादी') || 
    q.includes('विवाह') || q.includes('हल्दी') || q.includes('ਵਿਆਹ') || q.includes('বিয়ে') || 
    q.includes('கல்யாணம்') || q.includes('పెళ్లి') || q.includes('લગ્ન')
  ) {
    occasion = 'wedding';
  } else if (
    q.includes('puja') || q.includes('pooja') || q.includes('festive') || q.includes('festival') || 
    q.includes('diwali') || q.includes('teej') || q.includes('rakhi') || q.includes('garba') || 
    q.includes('chhath') || q.includes('पूजा') || q.includes('दिवाली') || q.includes('दीवाली') || 
    q.includes('तीज') || q.includes('ਪੂਜਾ') || q.includes('পূজা') || q.includes('பூஜை') || q.includes('పూజ')
  ) {
    occasion = 'festival';
  } else if (q.includes('office') || q.includes('work') || q.includes('formal') || q.includes('offis') || q.includes('ऑफ़िस')) {
    occasion = 'office';
  } else if (q.includes('daily') || q.includes('casual') || q.includes('summer')) {
    occasion = 'daily';
  }

  // Gender detection
  let gender: string | null = null;
  if (
    q.includes('bhai') || q.includes('men') || q.includes('man') || q.includes('boy') || 
    q.includes('boys') || q.includes('male') || q.includes('gents') || q.includes('भाई') || 
    q.includes('पुरुष') || q.includes('आदमी') || q.includes('लड़का') || q.includes('ਮੁੰਡੇ') || q.includes('ஆண்கள்')
  ) {
    gender = 'men';
  } else if (
    q.includes('saree') || q.includes('sari') || q.includes('kurti') || q.includes('lehenga') || 
    q.includes('women') || q.includes('woman') || q.includes('girl') || q.includes('girls') || 
    q.includes('female') || q.includes('lady') || q.includes('ladies') || q.includes('महिला') || 
    q.includes('स्त्री') || q.includes('लड़की') || q.includes('ਕੁੜੀਆਂ') || q.includes('பெண்கள்')
  ) {
    gender = 'women';
  } else if (q.includes('kid') || q.includes('kids') || q.includes('child') || q.includes('children') || q.includes('बच्चे') || q.includes('ਬੱਚੇ')) {
    gender = 'kids';
  }

  // Price parsing
  let maxPrice: number | undefined = undefined;
  if (q.includes('sasta') || q.includes('budget') || q.includes('cheap') || q.includes('सस्ता')) {
    maxPrice = 2500;
  }
  const matchNum = q.match(/under\s*(\d+)/) || q.match(/(\d+)\s*k/) || q.match(/(\d+)\s*rupees/) || q.match(/(\d+)\s*हजार/) || q.match(/(\d+)\s*के नीचे/);
  if (matchNum) {
    if (matchNum[0].includes('k') || matchNum[0].includes('हजार')) {
      maxPrice = parseInt(matchNum[1], 10) * 1000;
    } else {
      maxPrice = parseInt(matchNum[1], 10);
    }
  }

  // Transliterate key terms into English keywords for product matching
  const englishKeywords: string[] = [];
  if (q.includes('kurta') || q.includes('कुर्ता') || q.includes('ਕੁਰਤਾ') || q.includes('পাঞ্জাবি') || q.includes('குர்தா') || q.includes('కుర్తా')) englishKeywords.push('kurta');
  if (q.includes('saree') || q.includes('साड़ी') || q.includes('साडी') || q.includes('ਸ਼ਾਲ') || q.includes('শাড়ি') || q.includes('புடவை') || q.includes('చీర')) englishKeywords.push('saree');
  if (q.includes('suit') || q.includes('सूट') || q.includes('ਸੂਟ') || q.includes('patiala') || q.includes('पटियाला') || q.includes('ਪਟਿਆਲਾ')) englishKeywords.push('suit', 'patiala');
  if (q.includes('lehenga') || q.includes('लहंगा') || q.includes('લેહેંગા') || q.includes('ચણિયા ચોળી')) englishKeywords.push('lehenga');
  if (q.includes('jutti') || q.includes('जूती') || q.includes('ਜੁੱਤੀ') || q.includes('mojari')) englishKeywords.push('jutti', 'mojari');
  if (q.includes('wedding') || q.includes('shaadi') || q.includes('शादी') || q.includes('ਵਿਆਹ') || q.includes('বিয়ে') || q.includes('கல்யாணம்')) englishKeywords.push('wedding', 'shaadi');
  if (q.includes('diwali') || q.includes('दिवाली') || q.includes('दीवाली')) englishKeywords.push('diwali', 'festive');
  if (q.includes('silk') || q.includes('सिल्क') || q.includes('ਸਿਲਕ')) englishKeywords.push('silk');
  if (q.includes('chikankari') || q.includes('चिकनकारी')) englishKeywords.push('chikankari');
  if (q.includes('banarasi') || q.includes('बनारसी')) englishKeywords.push('banarasi');

  const words = q.split(/\s+/).filter(w => w.length > 2);
  const combinedKeywords = Array.from(new Set([...englishKeywords, ...words]));

  return {
    category: category || 'ethnic wear',
    occasion,
    gender,
    price_range: maxPrice ? { max: maxPrice } : null,
    keywords: combinedKeywords.length > 0 ? combinedKeywords : ['kurta', 'saree', 'ethnic']
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API Routes ---

  // 1. DYNAMIC CITY RESOLUTION ENDPOINT
  app.get("/api/search-cities", async (req, res) => {
    try {
      const q = (req.query.q as string || "").trim();
      if (!q || q.length < 2) {
        return res.json({ results: [] });
      }

      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)},India&countrycodes=in&format=json&addressdetails=1&limit=10`;
      const response = await fetch(geoUrl, {
        headers: {
          'User-Agent': 'MyntraBharatApp/1.0 (contact@myntrabharat.internal)'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const results = (data || []).map((item: any) => {
          const addr = item.address || {};
          const cityName = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county || addr.district || item.name;
          const stateName = addr.state || addr.state_district || addr.region || 'India';
          return {
            name: cityName,
            state: stateName,
            tier: 'Live Search',
            famousFor: item.display_name
          };
        });
        return res.json({ results });
      }
      return res.json({ results: [] });
    } catch (err) {
      console.warn("Live city search failed:", err);
      return res.json({ results: [] });
    }
  });

  app.post("/api/resolve-city", async (req, res) => {
    try {
      const inputCity = (req.body.city || "").trim();
      if (!inputCity) {
        return res.status(400).json({ error: "City name required" });
      }

      const cacheKey = inputCity.toLowerCase();
      if (cityCache.has(cacheKey)) {
        const cached = cityCache.get(cacheKey)!;
        return res.json({ ...cached, cached: true });
      }

      // Fast path 1: Exact dictionary lookup
      let resolvedState = FALLBACK_CITY_TO_STATE[cacheKey];
      let fallbackUsed = false;

      // Fast path 2: Substring dictionary match
      if (!resolvedState) {
        const matchKey = Object.keys(FALLBACK_CITY_TO_STATE).find(k => cacheKey.includes(k) || k.includes(cacheKey));
        if (matchKey) {
          resolvedState = FALLBACK_CITY_TO_STATE[matchKey];
          fallbackUsed = true;
        }
      }

      // Slow path: Only query external network if unlisted
      if (!resolvedState) {
        try {
          const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(inputCity)},India&format=json&addressdetails=1`;
          const response = await fetch(geoUrl, {
            headers: {
              'User-Agent': 'MyntraBharatApp/1.0 (contact@myntrabharat.internal)'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const place = data[0];
              const addr = place.address || {};
              resolvedState = addr.state || addr.state_district || addr.region;

              if (!resolvedState && place.display_name) {
                const parts = place.display_name.split(',').map((s: string) => s.trim());
                if (parts.length >= 2) {
                  resolvedState = parts[parts.length - 2];
                }
              }
            }
          }
        } catch (err) {
          console.warn("Nominatim lookup failed, using fallback logic:", err);
        }
      }

      // If still not resolved, query Gemini AI model
      if (!resolvedState) {
        try {
          const aiPrompt = `Identify the official Indian State or Union Territory for the Indian city/town/location "${inputCity}". Return JSON { "state": "StateName" }.`;
          const aiText = await generateContentWithRetry(aiPrompt);
          const aiParsed = JSON.parse(aiText || "{}");
          if (aiParsed.state) {
            resolvedState = aiParsed.state;
          }
        } catch (e) {
          console.warn("Gemini state resolution failed:", e);
        }
      }

      if (!resolvedState) {
        resolvedState = "Punjab";
        fallbackUsed = true;
      }

      const formattedCity = inputCity.charAt(0).toUpperCase() + inputCity.slice(1);
      const result = { city: formattedCity, state: resolvedState, fallbackUsed };
      
      cityCache.set(cacheKey, { city: formattedCity, state: resolvedState });
      return res.json(result);
    } catch (error) {
      console.error("City resolution error:", error);
      res.status(500).json({ error: "Failed to resolve city" });
    }
  });

  // 2. REVERSE GEOCODING ENDPOINT (Coordinates -> City & State)
  app.post("/api/reverse-geocode", async (req, res) => {
    try {
      const { lat, lng } = req.body;
      if (!lat || !lng) {
        return res.status(400).json({ error: "Lat and Lng required" });
      }

      const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      const response = await fetch(reverseUrl, {
        headers: {
          'User-Agent': 'MyntraBharatApp/1.0 (contact@myntrabharat.internal)'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        const detectedCity = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county || addr.district || 'Patiala';
        const detectedState = addr.state || 'Punjab';

        return res.json({ city: detectedCity, state: detectedState });
      }

      return res.json({ city: 'Patiala', state: 'Punjab' });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return res.json({ city: 'Patiala', state: 'Punjab' });
    }
  });

  // 3. AUTO DETECT LOCATION (IP / Network Fallback)
  app.post("/api/auto-detect-location", async (req, res) => {
    try {
      const geoRes = await fetch('http://ip-api.com/json/?fields=status,city,regionName,countryCode', { timeout: 3000 } as any);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.status === 'success' && geoData.countryCode === 'IN') {
          return res.json({
            city: geoData.city || 'Patiala',
            state: geoData.regionName || 'Punjab'
          });
        }
      }
      return res.json({ city: 'Patiala', state: 'Punjab' });
    } catch (err) {
      return res.json({ city: 'Patiala', state: 'Punjab' });
    }
  });

  // 4. COMBINED EDITORIAL & FESTIVAL CONTEXT ENDPOINT
  app.post("/api/editorial-context", async (req, res) => {
    const { city, state, userDate } = req.body;
    const targetCity = city || "Patiala";
    const targetState = state || "Punjab";
    const currentDateString = userDate || new Date().toISOString();
    
    const cacheKey = `${targetCity.toLowerCase()}_${targetState.toLowerCase()}`;
    if (editorialCache.has(cacheKey)) {
      return res.json({ ...editorialCache.get(cacheKey)!, cached: true });
    }

    try {
      const prompt = `
        You are an AI regional culture and fashion curator for Myntra Bharat.
        Current date and time on user's device: "${currentDateString}".
        Target Location: City "${targetCity}", State "${targetState}".

        TASK 1 (Festivals in 60-day span):
        Identify 2 to 3 major regional or national festivals happening in or coming up for "${targetState}" within a 60-day window from the current device date ("${currentDateString}").
        Provide accurate, verified festival names, date ranges, and concise 1-sentence cultural notes describing traditional fashion/attire for each.

        TASK 2 (Storefront Hero Banner Editorial Copy):
        Craft editorial copy for ${targetCity}'s storefront hero banner:
        - "headline": Short, punchy headline UNDER 8 WORDS for ${targetCity}.
        - "subtext": Editorial subtext UNDER 25 WORDS reflecting ${targetCity}, ${targetState}, and its upcoming festive fashion.

        Return strict JSON matching this schema:
        {
          "festivals": [
            {
              "name": "Name of Festival 1",
              "dateRange": "Date range e.g. August 10 - August 28",
              "culturalNote": "1-sentence note on fashion and celebration in ${targetState}"
            },
            {
              "name": "Name of Festival 2",
              "dateRange": "Date range e.g. September 1 - September 10",
              "culturalNote": "1-sentence note on fashion and celebration in ${targetState}"
            }
          ],
          "headline": "Hero headline under 8 words",
          "subtext": "Hero subtext under 25 words"
        }
      `;

      const schema = {
        type: Type.OBJECT,
        properties: {
          festivals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                dateRange: { type: Type.STRING },
                culturalNote: { type: Type.STRING }
              },
              required: ["name", "dateRange", "culturalNote"]
            }
          },
          headline: { type: Type.STRING },
          subtext: { type: Type.STRING }
        },
        required: ["festivals", "headline", "subtext"]
      };

      const rawText = await generateContentWithRetry(prompt, schema);
      const parsed = JSON.parse(rawText || "{}");

      const resultData = {
        festivals: parsed.festivals || [],
        headline: parsed.headline || `${targetCity}'s Regional Edit`,
        subtext: parsed.subtext || `Curated festive wear for ${targetCity}, ${targetState}.`,
        userDate: currentDateString,
        isQuotaFallback: false
      };

      editorialCache.set(cacheKey, resultData);
      return res.json(resultData);

    } catch (error: any) {
      console.log(`[Editorial Context] Serving regional curated editorial fallback for ${targetCity}, ${targetState}.`);
      const fallbackData = getQuotaFallbackEditorial(targetCity, targetState, currentDateString);
      editorialCache.set(cacheKey, fallbackData);
      return res.json(fallbackData);
    }
  });

  // 5. MULTI-LANGUAGE HINGLISH & INDIAN SCRIPT SEARCH INTENT ENDPOINT
  app.post("/api/search-intent", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || !query.trim()) {
        return res.status(400).json({ error: "Search query required" });
      }

      const trimmedQuery = query.trim();

      try {
        const prompt = `
          You are an AI conversational intent parser for Indian fashion e-commerce (Myntra Bharat).
          The query can be in ANY Indian language (Hindi Devanagari script e.g. 'भाई की शादी के लिए कुर्ता', Punjabi Gurmukhi e.g. 'ਪਟਿਆਲਾ ਸੂਟ', Bengali, Tamil, Telugu, Marathi, Gujarati, etc.), Hinglish, colloquial Indian English, spoken voice input, or standard English.
          
          TASK:
          1. Detect the core clothing intent regardless of script or language.
          2. Auto-translate clothing terms and intent into English filters.
          3. Generate an expanded list of English search keywords (e.g. 'kurta', 'saree', 'suit', 'lehenga', 'wedding', 'diwali', 'muga', 'chanderi', 'chikankari', 'jutti', 'mojari') plus the original input terms.

          Examples:
          - "भाई की शादी के लिए कुर्ता" -> category: "ethnic wear", occasion: "wedding", gender: "men", keywords: ["kurta", "wedding", "shaadi", "bhai"]
          - "ਪਟਿਆਲਾ ਸੂਟ ਅਤੇ ਜੁੱਤੀ" -> category: "ethnic wear", gender: "women", keywords: ["patiala", "suit", "salwar", "jutti", "punjabi"]
          - "দীवाली सिल्क साड़ी 3000 के नीचे" -> category: "ethnic wear", occasion: "festival", gender: "women", price_range: { max: 3000 }, keywords: ["saree", "silk", "diwali"]
          - "கல்யாணம் பட்டு புடவை" -> category: "ethnic wear", occasion: "wedding", gender: "women", keywords: ["silk", "saree", "pattu", "wedding"]

          Query to parse: "${trimmedQuery}"

          Parse into structured filter intent:
          - "category": ["ethnic wear", "western wear", "footwear", "accessories"] or null
          - "occasion": ["wedding", "festival", "daily", "office"] or null
          - "gender": ["men", "women", "kids"] or null
          - "price_range": object { "min": number, "max": number } or null
          - "keywords": array of key style/clothing/color/event terms translated into English

          Return strict JSON matching this schema.
        `;

        const schema = {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            occasion: { type: Type.STRING },
            gender: { type: Type.STRING },
            price_range: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER }
              }
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        };

        const rawText = await generateContentWithRetry(prompt, schema);
        const parsed = JSON.parse(rawText || "{}");
        return res.json({ intent: parsed, rawQuery: trimmedQuery });
      } catch (geminiError: any) {
        console.log("Search intent using multilingual rule-based parser fallback.");
        const fallbackIntent = parseMultilingualRuleBased(trimmedQuery);
        return res.json({ intent: fallbackIntent, rawQuery: trimmedQuery, fallbackUsed: true });
      }
    } catch (error) {
      console.error("Search intent error:", error);
      const fallbackIntent = parseMultilingualRuleBased(req.body.query || '');
      return res.json({ intent: fallbackIntent, rawQuery: req.body.query || '' });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
