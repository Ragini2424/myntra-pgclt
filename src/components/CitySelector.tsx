import React, { useState, useMemo } from 'react';
import { useCityTheme } from '../contexts/CityThemeContext';
import { MapPin, Search, Loader2, Sparkles, CheckCircle2, Building2 } from 'lucide-react';
import { searchIndianCities, IndianCity } from '../data/indianCities';

export function CitySelector() {
  const { city, state, isResolvingCity, cityResolvedInfo, setCityInput } = useCityTheme();
  const [inputVal, setInputVal] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const POPULAR_CITIES = [
    { name: 'Patna', state: 'Bihar' },
    { name: 'Lucknow', state: 'Uttar Pradesh' },
    { name: 'Jaipur', state: 'Rajasthan' },
    { name: 'Kochi', state: 'Kerala' },
    { name: 'Kolkata', state: 'West Bengal' },
    { name: 'Amritsar', state: 'Punjab' },
    { name: 'Indore', state: 'Madhya Pradesh' },
    { name: 'Guwahati', state: 'Assam' }
  ];

  const filteredSuggestions = useMemo(() => {
    return searchIndianCities(inputVal);
  }, [inputVal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setCityInput(inputVal);
      setInputVal('');
      setIsOpen(false);
    }
  };

  const handleSelectCity = (cityName: string) => {
    setCityInput(cityName);
    setInputVal('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* City Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white shadow-xs hover:border-gray-300 transition-all text-left group cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600 group-hover:scale-105 transition-transform">
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-gray-900">
              {city}
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200/50">
              {state}
            </span>
          </div>
          <span className="text-[9px] font-medium text-gray-500">
            Click to change city or state
          </span>
        </div>
        
        {isResolvingCity ? (
          <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin ml-1" />
        ) : (
          <span className="text-[10px] font-black text-gray-500 ml-1">▼</span>
        )}
      </button>

      {/* Dropdown Modal / Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                City & State Resolver
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-700 px-2 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
            Type <strong className="text-gray-800">ANY Indian city or state name</strong> (e.g. Patna, Bihar, Lucknow, UP, Siliguri, Kochi). It resolves dynamically to its State via Nominatim AI.
          </p>

          {/* Form input */}
          <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type any city or state..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all font-medium text-gray-900"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={isResolvingCity || !inputVal.trim()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isResolvingCity ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Resolve'}
            </button>
          </form>

          {/* Real-time search suggestions dropdown */}
          {inputVal.trim().length > 0 && (
            <div className="mb-3 max-h-40 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white">
              {filteredSuggestions.length === 0 ? (
                <div className="p-2.5 text-[11px] text-gray-500 text-center">
                  Press 'Resolve' to run dynamic OpenStreetMap lookup for "{inputVal}"
                </div>
              ) : (
                filteredSuggestions.map((item) => (
                  <button
                    key={`${item.name}_${item.state}`}
                    type="button"
                    onClick={() => handleSelectCity(item.name)}
                    className="w-full p-2 text-left hover:bg-amber-50/60 flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-bold text-gray-900">{item.name}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-semibold">
                        {item.state}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600">Select →</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Current Resolution Info */}
          <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-xl mb-3 flex items-center justify-between text-[10px]">
            <span className="font-medium text-amber-900">Active Location: <strong className="font-bold">{city}, {state}</strong></span>
            {cityResolvedInfo?.cached ? (
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-amber-600" /> Cached Lookup
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                🌐 Live Nominatim API
              </span>
            )}
          </div>

          {/* Quick city suggestions */}
          <div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
              Popular Cities & States
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSelectCity(c.name)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    city.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {c.name} ({c.state})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
