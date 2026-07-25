import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Mic, AlertCircle, Volume2 } from 'lucide-react';
import { SearchIntent } from '../types';

interface SearchBarProps {
  onSearchIntent: (intentData: { intent: SearchIntent; rawQuery: string } | null) => void;
  activeSearchQuery: string | null;
  isLoading: boolean;
  isBharatMode?: boolean;
}

export function SearchBar({ onSearchIntent, activeSearchQuery, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVoiceTooltip, setShowVoiceTooltip] = useState<boolean>(() => {
    return sessionStorage.getItem('dismissed_voice_tooltip') !== 'true';
  });

  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stop recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleSearchSubmit = async (searchString: string) => {
    const trimmed = searchString.trim();
    if (!trimmed) {
      onSearchIntent(null);
      return;
    }

    try {
      setIsSubmitting(true);
      setSearchError(null);

      const res = await fetch('/api/search-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.intent) {
        onSearchIntent({ intent: data.intent, rawQuery: trimmed });
      } else {
        setSearchError('Could not process search query. Showing matching items.');
        onSearchIntent({
          intent: { category: 'ethnic wear', keywords: [trimmed] },
          rawQuery: trimmed
        });
      }
    } catch (e: any) {
      console.error("Search intent request failed:", e);
      setSearchError('Using quick match filter.');
      onSearchIntent({
        intent: { category: 'ethnic wear', keywords: [trimmed] },
        rawQuery: trimmed
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit(query);
  };

  const handleClear = () => {
    setQuery('');
    setSearchError(null);
    setVoiceNote(null);
    onSearchIntent(null);
  };

  // Toggle voice listening
  const toggleVoiceSearch = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      setVoiceNote(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition API not available in window");
      setVoiceNote('Voice search is not supported in this browser. Please type your query.');
      return;
    }

    const startRecognition = () => {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = navigator.language || 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceNote('Listening... Speak now!');
          setSearchError(null);
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setQuery(transcript);
          if (event.results[0].isFinal) {
            setIsListening(false);
            setVoiceNote(null);
            handleSearchSubmit(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          const errCode = event?.error || 'unknown';

          if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
            setVoiceNote('Mic access blocked. Please allow microphone permission in browser settings.');
          } else if (errCode === 'no-speech') {
            setVoiceNote('No speech detected — speak clearly and tap mic again');
          } else if (errCode === 'network') {
            setVoiceNote('Speech service unavailable in browser — please type your query.');
          } else {
            setVoiceNote(`Voice recognition note (${errCode}) — tap mic to retry or type query.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error("Voice search start exception:", err);
        setIsListening(false);
        setVoiceNote('Could not start microphone. Check browser permissions.');
      }
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        setVoiceNote('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        startRecognition();
      } catch (err: any) {
        console.error("Microphone getUserMedia error:", err);
        setIsListening(false);
        setVoiceNote('Mic permission denied. Allow microphone access in site settings or top bar.');
      }
    } else {
      startRecognition();
    }
  };

  return (
    <div className="w-full relative">
      <form onSubmit={handleFormSubmit} className="relative w-full flex items-center z-10">
        
        {/* Search Input Box - Authentic Myntra Style */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="relative flex-1 flex items-center bg-[#f5f5f6] hover:bg-[#ebebeb] focus-within:bg-white border border-transparent focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#F13AB1]/10 rounded-md transition-all cursor-text py-0.5"
        >
          
          {/* Clickable Search Icon on Left */}
          <button 
            type="submit"
            title="Click to search"
            className="p-2.5 text-gray-400 hover:text-[#F13AB1] transition-colors cursor-pointer shrink-0 z-10"
          >
            {isSubmitting || isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#F13AB1]" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>

          <input
            ref={inputRef}
            id="header-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (searchError) setSearchError(null);
              if (voiceNote) setVoiceNote(null);
            }}
            placeholder={isListening ? "Listening... speak now" : "Search"}
            className="w-full py-2 pr-20 bg-transparent text-xs text-[#282c3f] font-normal outline-none placeholder:text-gray-400 cursor-text relative z-0"
          />

          {/* Right Controls inside Input Box */}
          <div className="absolute right-2 flex items-center gap-1.5 z-10 pointer-events-auto">
            
            {/* Clear button */}
            {(activeSearchQuery || query) && (
              <button
                type="button"
                id="header-search-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mic Icon Button & Voice Search Tooltip */}
            <div className="relative">
              <button
                type="button"
                id="header-mic-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVoiceSearch();
                }}
                className={`p-1.5 rounded-md transition-all cursor-pointer relative border ${
                  isListening
                    ? 'bg-[#F13AB1] text-white border-[#F13AB1] animate-pulse ring-2 ring-[#F13AB1]/30'
                    : 'bg-white text-[#F13AB1] border-rose-200 hover:bg-rose-50'
                }`}
                title={isListening ? 'Stop voice listening' : 'Voice search'}
              >
                {isListening ? <Volume2 className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              {/* Clean Tooltip for Voice Search */}
              {showVoiceTooltip && !isListening && !query && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVoiceSearch();
                  }}
                  className="absolute right-0 top-full mt-2 z-[100] animate-bounce-short pointer-events-auto drop-shadow-2xl"
                >
                  {/* Arrow Pointing Up */}
                  <div className="absolute -top-1.5 right-3.5 w-3 h-3 bg-[#F13AB1] rotate-45 rounded-2xs z-10" />
                  
                  <div className="relative z-20 bg-gradient-to-r from-[#F13AB1] via-pink-600 to-rose-500 text-white px-3.5 py-2 rounded-xl shadow-2xl border border-white/30 flex items-center gap-2.5 cursor-pointer hover:scale-[1.02] transition-all whitespace-nowrap">
                    <div className="w-5.5 h-5.5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                      <Mic className="w-3.5 h-3.5 text-white" />
                    </div>
                    
                    <div className="flex flex-col text-left pr-1">
                      <span className="text-xs font-bold tracking-wide text-white leading-tight">
                        Search by voice
                      </span>
                      <span className="text-[9px] text-rose-100 font-normal">
                        Tap mic to speak
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowVoiceTooltip(false);
                        sessionStorage.setItem('dismissed_voice_tooltip', 'true');
                      }}
                      className="ml-auto p-0.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                      title="Dismiss tip"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </form>

      {/* Voice Status Note */}
      {voiceNote && (
        <div className="mt-1.5 px-2.5 py-1.5 bg-rose-50/90 border border-rose-200 rounded-xl flex items-center gap-1.5 text-[11px] font-medium text-rose-800 shadow-xs animate-fade-in">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#F13AB1]" />
          <span className="font-semibold">{voiceNote}</span>
          <button onClick={() => setVoiceNote(null)} className="text-gray-400 hover:text-gray-600 text-[10px] ml-auto underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {searchError && !voiceNote && (
        <div className="mt-1 px-1 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 animate-fade-in">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{searchError}</span>
          <button onClick={() => setSearchError(null)} className="text-gray-400 hover:text-gray-600 text-[10px] ml-auto underline">Dismiss</button>
        </div>
      )}
    </div>
  );
}
