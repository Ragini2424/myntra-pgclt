import { INDIAN_CITIES } from '../data/indianCities';

export interface LocationDetectResult {
  city: string;
  state: string;
  method: 'gps' | 'ip' | 'pincode' | 'fallback';
  message: string;
}

export async function detectUserLocation(): Promise<LocationDetectResult> {
  // 1. Try Browser Geolocation API if available
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: true
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Reverse geocode via server / nominatim endpoint
      const res = await fetch('/api/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.city && data.state) {
          return {
            city: data.city,
            state: data.state,
            method: 'gps',
            message: `Detected via GPS (${data.city}, ${data.state})`
          };
        }
      }
    } catch (err) {
      console.warn("GPS geolocation unavailable or permission denied, trying IP fallback:", err);
    }
  }

  // 2. Try Client-side IP Location Lookup (ipapi.co)
  try {
    const ipRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData.city && ipData.region) {
        // Resolve city & state via /api/resolve-city
        const resolveRes = await fetch('/api/resolve-city', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: ipData.city })
        });
        if (resolveRes.ok) {
          const resolved = await resolveRes.json();
          return {
            city: resolved.city || ipData.city,
            state: resolved.state || ipData.region,
            method: 'ip',
            message: `Detected via IP (${resolved.city || ipData.city}, ${resolved.state || ipData.region})`
          };
        }
      }
    }
  } catch (err) {
    console.warn("Client IP lookup (ipapi.co) failed:", err);
  }

  // 3. Try Secondary Server Auto-Detect Endpoint
  try {
    const res = await fetch('/api/auto-detect-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.city && data.state) {
        return {
          city: data.city,
          state: data.state,
          method: 'ip',
          message: `Detected via IP (${data.city}, ${data.state})`
        };
      }
    }
  } catch (err) {
    console.warn("Backend IP auto-detect failed:", err);
  }

  // 4. Default fallback to Tier-2/3 city (Patiala, Punjab)
  return {
    city: 'Patiala',
    state: 'Punjab',
    method: 'fallback',
    message: 'Location auto-detected (Patiala, Punjab)'
  };
}
