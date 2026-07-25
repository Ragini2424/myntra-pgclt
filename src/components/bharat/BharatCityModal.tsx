import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapPin, ArrowRight, Loader2, X, Navigation, Check, Sparkles, Building2, Map as MapIcon } from 'lucide-react';
import { INDIAN_CITIES, searchIndianCities, IndianCity } from '../../data/indianCities';
import { detectUserLocation } from '../../utils/geolocation';

interface BharatCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (cityName: string) => Promise<void>;
  initialCity?: string;
}

export function BharatCityModal({ isOpen, onClose, onSelectCity, initialCity = '' }: BharatCityModalProps) {
  const [inputVal, setInputVal] = useState(initialCity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveResults, setLiveResults] = useState<IndianCity[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Client-side cache for recent lookups to avoid redundant API calls
  const lookupCache = useRef<Map<string, IndianCity[]>>(new Map());

  // Popular State Quick Chips
  const POPULAR_STATES = [
    { name: 'Rajasthan', defaultCity: 'Jaipur' },
    { name: 'Uttar Pradesh', defaultCity: 'Lucknow' },
    { name: 'Bihar', defaultCity: 'Patna' },
    { name: 'Punjab', defaultCity: 'Amritsar' },
    { name: 'Maharashtra', defaultCity: 'Mumbai' },
    { name: 'West Bengal', defaultCity: 'Kolkata' },
    { name: 'Karnataka', defaultCity: 'Bengaluru' },
    { name: 'Gujarat', defaultCity: 'Ahmedabad' },
  ];

  // Sync initialCity when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputVal(initialCity);
      setErrorMsg(null);
      setStatusMsg(null);
    }
  }, [isOpen, initialCity]);

  // Debounced Live Search against /api/search-cities (OpenStreetMap Nominatim)
  useEffect(() => {
    const q = inputVal.trim();
    if (q.length < 2) {
      setLiveResults([]);
      setIsSearchingLive(false);
      return;
    }

    if (lookupCache.current.has(q.toLowerCase())) {
      setLiveResults(lookupCache.current.get(q.toLowerCase()) || []);
      setIsSearchingLive(false);
      return;
    }

    setIsSearchingLive(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-cities?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          const items: IndianCity[] = (data.results || []).map((r: any) => ({
            name: r.name,
            state: r.state,
            tier: 'Tier 3' as const,
            famousFor: r.famousFor
          }));
          lookupCache.current.set(q.toLowerCase(), items);
          setLiveResults(items);
        }
      } catch (err) {
        console.warn("Live lookup error:", err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputVal]);

  // Combined suggestions: local fast matches + live geocoding results
  const suggestions = useMemo(() => {
    const localMatches = searchIndianCities(inputVal);
    const mergedMap = new Map<string, IndianCity>();

    localMatches.forEach(c => {
      mergedMap.set(`${c.name.toLowerCase()}_${c.state.toLowerCase()}`, c);
    });

    liveResults.forEach(r => {
      const key = `${r.name.toLowerCase()}_${r.state.toLowerCase()}`;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, r);
      }
    });

    return Array.from(mergedMap.values());
  }, [inputVal, liveResults]);

  if (!isOpen) return null;

  const handleSubmit = async (cityNameToSubmit?: string) => {
    const target = (cityNameToSubmit || inputVal).trim();
    if (!target) {
      setErrorMsg('Please select or enter a valid Indian city name');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSelectCity(target);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not resolve location. Please select a valid Indian city.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSelectSuggestion = (cityObj: IndianCity) => {
    setInputVal(cityObj.name);
    handleSubmit(cityObj.name);
  };

  const handleSelectStateChip = (stateObj: { name: string; defaultCity: string }) => {
    setInputVal(stateObj.name);
  };

  const handleAutoDetect = async () => {
    try {
      setIsDetecting(true);
      setErrorMsg(null);
      setStatusMsg('Detecting location via GPS / Network...');

      const result = await detectUserLocation();
      setInputVal(result.city);
      setStatusMsg(result.message);

      await onSelectCity(result.city);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg('Auto-detection failed. Please select your city from the list below.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-lg p-6 sm:p-8 relative space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F13AB1] to-[#FD913C] text-white mx-auto flex items-center justify-center shadow-md">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#29303E] tracking-tight">
            Select City or State
          </h2>
          <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
            Search any Indian city, town, or locality (e.g., Hoshiarpur, Bathinda, Muzaffarpur, Siliguri, Kohima).
          </p>
        </div>

        {/* Auto-Detect GPS Location Button */}
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={isDetecting || isSubmitting}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 hover:from-amber-500/20 text-[#29303E] border border-amber-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              {isDetecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left">
              <div className="font-extrabold text-gray-900 text-xs flex items-center gap-1.5">
                <span>Auto-Detect GPS Location</span>
                <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-black uppercase">LIVE</span>
              </div>
              <span className="text-[10px] text-gray-500 font-medium">Use device location or IP network lookup</span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </button>

        {statusMsg && (
          <p className="text-xs font-semibold text-amber-800 bg-amber-50 p-2 rounded-xl text-center border border-amber-200">
            {statusMsg}
          </p>
        )}

        {/* Quick Popular State / Region Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block flex items-center gap-1">
            <MapIcon className="w-3 h-3" /> Quick Filter by State:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_STATES.map((st) => (
              <button
                key={st.name}
                type="button"
                onClick={() => handleSelectStateChip(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  inputVal.toLowerCase() === st.name.toLowerCase()
                    ? 'bg-[#F13AB1] text-white border-[#F13AB1] shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Location Form & Search Input */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Type City or State Name
              </label>
              {isSearchingLive && (
                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Searching live map...
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Search Hoshiarpur, Bathinda, Muzaffarpur, Siliguri, Warangal..."
                autoFocus
                autoComplete="off"
                disabled={isSubmitting || isDetecting}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-bold text-gray-900 outline-none focus:border-[#F13AB1] focus:bg-white focus:ring-2 focus:ring-[#F13AB1]/10 transition-all placeholder:text-gray-400 placeholder:font-medium"
              />
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              
              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600 mt-1">{errorMsg}</p>
            )}

            {/* VALID CITIES & STATES DROPDOWN MENU */}
            <div className="mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-56 overflow-y-auto divide-y divide-gray-100 text-xs">
              <div className="p-2 bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center justify-between">
                <span>
                  {inputVal ? `Matching Cities (${suggestions.length})` : 'Popular Indian Cities'}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">Click any city to set location</span>
              </div>

              {suggestions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 font-medium space-y-1">
                  {isSearchingLive ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-amber-600 font-bold text-xs">
                      <Loader2 className="w-4 h-4 animate-spin" /> Searching OpenStreetMap for "{inputVal}"...
                    </div>
                  ) : (
                    <>
                      <p>No exact match in fast index for "{inputVal}".</p>
                      <p className="text-[11px] text-gray-400">Click "Confirm Location" below to run full geocoding lookup for "{inputVal}".</p>
                    </>
                  )}
                </div>
              ) : (
                suggestions.map((cityObj, idx) => {
                  const isSelected = inputVal.toLowerCase() === cityObj.name.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={`${cityObj.name}_${cityObj.state}_${idx}`}
                      onClick={() => handleSelectSuggestion(cityObj)}
                      className={`w-full p-2.5 text-left transition-colors flex items-center justify-between group cursor-pointer ${
                        isSelected ? 'bg-rose-50/80 text-[#F13AB1]' : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#F13AB1] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-rose-100 group-hover:text-[#F13AB1]'
                        }`}>
                          <Building2 className="w-3.5 h-3.5" />
                        </div>

                        <div>
                          <div className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                            <span>{cityObj.name}</span>
                            <span className="text-[10px] bg-amber-100/80 text-amber-900 px-1.5 py-0.2 rounded font-extrabold border border-amber-200/60">
                              {cityObj.state}
                            </span>
                            {cityObj.tier && (
                              <span className="text-[9px] text-gray-400 font-semibold hidden sm:inline">
                                • {cityObj.tier}
                              </span>
                            )}
                          </div>
                          {cityObj.famousFor && (
                            <span className="text-[10px] text-gray-400 font-medium block truncate max-w-[220px] sm:max-w-xs">
                              {cityObj.famousFor}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isSelected && <Check className="w-4 h-4 text-[#F13AB1]" />}
                        <span className="text-[10px] font-extrabold text-[#F13AB1] opacity-0 group-hover:opacity-100 transition-opacity">
                          Select →
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting || isDetecting || !inputVal.trim()}
            className="w-full py-3 px-6 bg-[#F13AB1] hover:brightness-105 active:scale-[0.99] text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resolving location...</span>
              </>
            ) : (
              <>
                <span>Confirm Location ({inputVal || 'Enter City'})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
