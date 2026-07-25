import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FestivalItem, BannerCopyData } from '../types';
import { detectUserLocation } from '../utils/geolocation';
import { searchIndianCities } from '../data/indianCities';

interface CityThemeContextType {
  city: string;
  state: string;
  festivals: FestivalItem[];
  bannerData: BannerCopyData | null;
  editorialError: string | null;
  userDeviceDate: string;
  isResolvingCity: boolean;
  isFetchingEditorial: boolean;
  isManualOverride: boolean;
  cityResolvedInfo: { cached?: boolean; fallbackUsed?: boolean } | null;
  setCityInput: (cityName: string) => Promise<void>;
  refreshEditorial: (cityName?: string, stateName?: string) => Promise<void>;
  autoDetectLocationNow: () => Promise<void>;
  resetToAutoDetect: () => Promise<void>;
}

const CityThemeContext = createContext<CityThemeContextType | undefined>(undefined);

// State-specific color palettes for dynamic theme accenting
export const STATE_ACCENTS: Record<string, { primary: string; secondary: string; bg: string }> = {
  'Bihar': { primary: '#D97706', secondary: '#B45309', bg: '#FFFBEB' }, // Warm Silk / Saffron
  'Uttar Pradesh': { primary: '#4338CA', secondary: '#3730A3', bg: '#EEF2FF' }, // Royal Navy Chikankari
  'Maharashtra': { primary: '#DC2626', secondary: '#991B1B', bg: '#FEF2F2' }, // Paithani Maroon
  'West Bengal': { primary: '#E11D48', secondary: '#BE123C', bg: '#FFF1F2' }, // Crimson Red & White
  'Rajasthan': { primary: '#EA580C', secondary: '#C2410C', bg: '#FFEDD5' }, // Bandhani Terracotta
  'Gujarat': { primary: '#059669', secondary: '#047857', bg: '#ECFDF5' }, // Festive Emerald
  'Tamil Nadu': { primary: '#7C3AED', secondary: '#6D28D9', bg: '#F5F3FF' }, // Temple Gold & Purple
  'Punjab': { primary: '#D97706', secondary: '#B45309', bg: '#FEF3C7' }, // Mustard Phulkari
  'Karnataka': { primary: '#2563EB', secondary: '#1D4ED8', bg: '#EFF6FF' }, // Royal Blue Silk
  'Kerala': { primary: '#65A30D', secondary: '#4D7C0F', bg: '#F7FEE7' }, // Kasavu Off-white & Gold
  'Telangana': { primary: '#9333EA', secondary: '#7E22CE', bg: '#FAF5FF' }, // Pochampally Ikat
  'Assam': { primary: '#0D9488', secondary: '#0F766E', bg: '#F0FDFA' }, // Muga Silk Teal
  'Delhi': { primary: '#2563EB', secondary: '#1E40AF', bg: '#EFF6FF' }, // Urban Chic
};

// Default fallback regional festivals for instant 0ms rendering
export const DEFAULT_STATE_FESTIVALS: Record<string, FestivalItem[]> = {
  'Punjab': [
    { name: 'Teej & Baisakhi Celebrations', dateRange: 'August 12 - August 28', culturalNote: 'Bright Phulkari embroidered dupattas, Patiala salwar suits, and hand-stitched Punjabi juttis.' },
    { name: 'Lohri & Shaadi Season', dateRange: 'October 15 - November 30', culturalNote: 'Royal Patiala suits, heavy zari sherwanis, and festive knitwear across Punjab.' }
  ],
  'Bihar': [
    { name: 'Hariyali & Kajari Teej', dateRange: 'August 14 - August 18', culturalNote: 'Women adorn vibrant green and red silk sarees with traditional gold jewelry and mehendi.' },
    { name: 'Chhath Puja & Festivities', dateRange: 'October 25 - November 5', culturalNote: 'Traditional Tussar silk sarees and embroidered kurtas celebrating Mithila heritage.' }
  ],
  'Uttar Pradesh': [
    { name: 'Lucknow Mahotsav & Festive Season', dateRange: 'August 15 - August 28', culturalNote: 'Elegant Lucknowi Chikankari kurtas and pastel ethnic suits decorated with intricate zardozi.' },
    { name: 'Dev Deepawali & Ganga Mahotsav', dateRange: 'November 10 - November 20', culturalNote: 'Banarasi silk sarees, brocades, and traditional drapes for holy city festivities.' }
  ],
  'West Bengal': [
    { name: 'Durga Puja Showcase', dateRange: 'September 15 - October 15', culturalNote: 'Red-bordered Garad silks, Jamdani drapes, designer ethnic wear, and festive footwear.' },
    { name: 'Poila Baisakh & Kali Puja', dateRange: 'October 20 - November 10', culturalNote: 'Handloom Taant sarees and festive cotton kurtas.' }
  ],
  'Maharashtra': [
    { name: 'Ganesh Chaturthi Utsav', dateRange: 'September 12 - September 22', culturalNote: 'Rich Paithani sarees, Nauvari drapes, and silk dhotis celebrating Lord Ganesha.' },
    { name: 'Gudi Padwa & Diwali Utsav', dateRange: 'October 20 - November 10', culturalNote: 'Kolhapuri chappals, silk Peshwai kurtas, and traditional gold jewelry.' }
  ],
  'Gujarat': [
    { name: 'Navratri Garba Mahotsav', dateRange: 'September 20 - October 10', culturalNote: 'Bandhani tie-dye, mirror-work Chaniya Cholis, and handcrafted Mojaris.' },
    { name: 'Uttarayan & Diwali Celebrations', dateRange: 'October 25 - November 15', culturalNote: 'Patola silks, embroidered kurtis, and festive footwear.' }
  ],
  'Rajasthan': [
    { name: 'Teej & Gangaur Utsav', dateRange: 'August 10 - August 25', culturalNote: 'Bandhani, Gota Patti, and royal Mewari silk lehengas.' },
    { name: 'Marwar & Pushkar Fair', dateRange: 'October 15 - November 15', culturalNote: 'Royal Jodhpuri kurtas, camel leather mojaris, and festive dupattas.' }
  ],
  'Tamil Nadu': [
    { name: 'Pongal & Harvest Festival', dateRange: 'January 10 - January 20', culturalNote: 'Kanchipuram gold zari silk sarees, Veshti Pattu sets, and temple jewelry.' },
    { name: 'Margazhi & Chithirai Utsav', dateRange: 'December 15 - January 15', culturalNote: 'Sungudi cotton sarees, Pattu Pavadai, and traditional ethnic drapes.' }
  ],
  'Karnataka': [
    { name: 'Mysore Dasara Grand Utsav', dateRange: 'October 1 - October 15', culturalNote: 'Pure Mysore gold zari silks, Kasuti embroidered sarees, and royal kurtas.' },
    { name: 'Ugadi & Karaga Celebrations', dateRange: 'March 20 - April 10', culturalNote: 'Traditional silk drapes, gold accessories, and ethnic footwear.' }
  ],
  'Kerala': [
    { name: 'Onam Harvest Celebrations', dateRange: 'August 20 - September 10', culturalNote: 'Kasavu off-white and gold sarees, handwoven Mundus, and festive jewelry.' },
    { name: 'Vishu & Attukal Utsav', dateRange: 'April 10 - April 20', culturalNote: 'Golden border drapes, silk shirts, and traditional footwear.' }
  ]
};

export function CityThemeProvider({ children }: { children: React.ReactNode }) {
  const [isManualOverride, setIsManualOverride] = useState<boolean>(() => {
    return localStorage.getItem('user_manual_override') === 'true';
  });

  const [city, setCity] = useState<string>(() => localStorage.getItem('user_city') || 'Patiala');
  const [state, setState] = useState<string>(() => localStorage.getItem('user_state') || 'Punjab');
  const [cityResolvedInfo, setCityResolvedInfo] = useState<{ cached?: boolean; fallbackUsed?: boolean } | null>({ cached: true, fallbackUsed: false });

  // Get current system date/time from user's device
  const getUserDateString = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const [userDeviceDate] = useState<string>(getUserDateString());

  // Initialize festivals immediately with instant regional default
  const [festivals, setFestivals] = useState<FestivalItem[]>(() => {
    const initialState = localStorage.getItem('user_state') || 'Punjab';
    return DEFAULT_STATE_FESTIVALS[initialState] || [
      {
        name: `${initialState} Festive Celebration`,
        dateRange: 'Upcoming Season',
        culturalNote: `Vibrant festive ethnic wear and traditional attire tailored for celebrations across ${initialState}.`
      }
    ];
  });

  const [bannerData, setBannerData] = useState<BannerCopyData | null>(() => {
    const initialCity = localStorage.getItem('user_city') || 'Patiala';
    const initialState = localStorage.getItem('user_state') || 'Punjab';
    return {
      headline: `${initialCity}'s Regional Festive Edit`,
      subtext: `Curated festive silks, hand-embroidered ethnic wear, and festive footwear for ${initialCity}, ${initialState}.`
    };
  });

  const [editorialError, setEditorialError] = useState<string | null>(null);

  const [isResolvingCity, setIsResolvingCity] = useState<boolean>(false);
  const [isFetchingEditorial, setIsFetchingEditorial] = useState<boolean>(false);

  // Fetch live Gemini editorial context passing user's actual device date/time
  const refreshEditorial = useCallback(async (cityName?: string, stateName?: string) => {
    const targetCity = cityName || city;
    const targetState = stateName || state;

    // 1. INSTANT ZERO-LATENCY LOCAL UPDATE
    const instantFestivals = DEFAULT_STATE_FESTIVALS[targetState] || [
      {
        name: `${targetState} Festive & Cultural Season`,
        dateRange: 'Upcoming Regional Window',
        culturalNote: `Vibrant festive ethnic wear and traditional attire tailored for celebrations across ${targetState}.`
      }
    ];
    setFestivals(instantFestivals);
    setBannerData({
      headline: `${targetCity}'s Regional Festive Edit`,
      subtext: `Curated festive silks, hand-embroidered ethnic wear, and festive footwear for ${targetCity}, ${targetState}.`
    });

    try {
      setIsFetchingEditorial(true);
      setEditorialError(null);

      const currentDateFromDevice = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const res = await fetch('/api/editorial-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: targetCity,
          state: targetState,
          userDate: currentDateFromDevice
        })
      });

      if (!res.ok) {
        return;
      }

      const data = await res.json();
      if (data && Array.isArray(data.festivals) && data.festivals.length > 0) {
        setFestivals(data.festivals);
        setBannerData({
          headline: data.headline,
          subtext: data.subtext,
          cached: data.cached
        });
        setEditorialError(null);
      }
    } catch (e: any) {
      console.error("Failed to fetch editorial context:", e);
    } finally {
      setIsFetchingEditorial(false);
    }
  }, [city, state]);

  // Function to perform GPS / IP auto-detection
  const autoDetectLocationNow = useCallback(async () => {
    try {
      setIsResolvingCity(true);
      const loc = await detectUserLocation();
      if (loc.city && loc.state) {
        setCity(loc.city);
        setState(loc.state);
        localStorage.setItem('user_city', loc.city);
        localStorage.setItem('user_state', loc.state);
        await refreshEditorial(loc.city, loc.state);
      }
    } catch (err) {
      console.warn("Auto detect location failed:", err);
    } finally {
      setIsResolvingCity(false);
    }
  }, [refreshEditorial]);

  // Reset manual override and re-run auto-detect
  const resetToAutoDetect = useCallback(async () => {
    localStorage.removeItem('user_manual_override');
    setIsManualOverride(false);
    await autoDetectLocationNow();
  }, [autoDetectLocationNow]);

  // Trigger auto-detection on component mount UNLESS manual override is explicitly active
  useEffect(() => {
    const isOverride = localStorage.getItem('user_manual_override') === 'true';
    if (!isOverride) {
      autoDetectLocationNow();
    } else {
      refreshEditorial(city, state);
    }
  }, []);

  // Set city input with geocoding lookup (Manual Override)
  const setCityInput = async (cityName: string) => {
    const trimmed = cityName.trim();
    if (!trimmed) return;

    // 1. Instant client-side lookup from static dictionary if available
    const matchedCities = searchIndianCities(trimmed);
    if (matchedCities.length > 0) {
      const instantMatch = matchedCities[0];
      setCity(instantMatch.name);
      setState(instantMatch.state);
      localStorage.setItem('user_city', instantMatch.name);
      localStorage.setItem('user_state', instantMatch.state);
      localStorage.setItem('user_manual_override', 'true');
      setIsManualOverride(true);
      refreshEditorial(instantMatch.name, instantMatch.state);
    } else {
      const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      setCity(formatted);
      localStorage.setItem('user_city', formatted);
      refreshEditorial(formatted, state);
    }

    try {
      setIsResolvingCity(true);
      const res = await fetch('/api/resolve-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: trimmed })
      });
      const data = await res.json();
      
      if (data.city && data.state) {
        setCity(data.city);
        setState(data.state);
        localStorage.setItem('user_city', data.city);
        localStorage.setItem('user_state', data.state);
        localStorage.setItem('user_manual_override', 'true');
        setIsManualOverride(true);
        setCityResolvedInfo({ cached: data.cached, fallbackUsed: data.fallbackUsed });
        
        refreshEditorial(data.city, data.state);
      }
    } catch (e) {
      console.error("City resolution failed:", e);
    } finally {
      setIsResolvingCity(false);
    }
  };

  return (
    <CityThemeContext.Provider value={{
      city,
      state,
      festivals,
      bannerData,
      editorialError,
      userDeviceDate,
      isResolvingCity,
      isFetchingEditorial,
      isManualOverride,
      cityResolvedInfo,
      setCityInput,
      refreshEditorial,
      autoDetectLocationNow,
      resetToAutoDetect
    }}>
      {children}
    </CityThemeContext.Provider>
  );
}

export function useCityTheme() {
  const context = useContext(CityThemeContext);
  if (context === undefined) {
    throw new Error('useCityTheme must be used within a CityThemeProvider');
  }
  return context;
}
