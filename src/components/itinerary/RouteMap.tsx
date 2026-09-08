"use client";

import { useEffect, useRef, useState } from "react";

interface RouteMapProps {
  from: string;
  to: string;
}

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

// Load Google Maps script once
let mapsLoaded = false;
let mapsCallbacks: (() => void)[] = [];

function loadMapsAPI(apiKey: string) {
  if (mapsLoaded) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise<void>((resolve) => {
    if (window.google?.maps) {
      mapsLoaded = true;
      resolve();
      return;
    }

    mapsCallbacks.push(resolve);

    if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

    window.initGoogleMaps = () => {
      mapsLoaded = true;
      mapsCallbacks.forEach((cb) => cb());
      mapsCallbacks = [];
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps&libraries=geometry`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

export default function RouteMap({ from, to }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;

    let cancelled = false;

    async function initMap() {
      try {
        await loadMapsAPI(apiKey!);
        if (cancelled || !mapRef.current) return;

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          zoom: 7,
          center: { lat: 21.0, lng: 73.0 },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#c0c0c0" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e9f6" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });
        mapInstanceRef.current = map;

        // Get directions
        const directionsService = new google.maps.DirectionsService();
        const fromCity = `${from}, India`;
        const toCity = `${to}, India`;

        directionsService.route(
          {
            origin: fromCity,
            destination: toCity,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (cancelled) return;

            if (status === "OK" && result) {
              // Draw outward route — solid teal line
              const outwardRenderer = new google.maps.DirectionsRenderer({
                map,
                directions: result,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#0d9488",
                  strokeWeight: 4,
                  strokeOpacity: 1,
                },
              });

              // Draw return route — dotted line
              const returnPath = result.routes[0]?.overview_path;
              if (returnPath) {
                new google.maps.Polyline({
                  path: [...returnPath].reverse(),
                  map,
                  strokeColor: "#f59e0b",
                  strokeWeight: 3,
                  strokeOpacity: 0,
                  icons: [
                    {
                      icon: {
                        path: "M 0,-1 0,1",
                        strokeOpacity: 0.7,
                        strokeColor: "#f59e0b",
                        strokeWeight: 3,
                        scale: 3,
                      },
                      offset: "0",
                      repeat: "16px",
                    },
                  ],
                });
              }

              // Custom markers
              const leg = result.routes[0]?.legs[0];
              if (leg) {
                // Origin marker
                new google.maps.Marker({
                  position: leg.start_location,
                  map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#0d9488",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 3,
                  },
                  label: {
                    text: "A",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "bold",
                  },
                  title: from,
                });

                // Destination marker
                new google.maps.Marker({
                  position: leg.end_location,
                  map,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#dc2626",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 3,
                  },
                  label: {
                    text: "B",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "bold",
                  },
                  title: to,
                });

                setRouteInfo({
                  distance: leg.distance?.text ?? "",
                  duration: leg.duration?.text ?? "",
                });
              }

              setLoading(false);
            } else {
              console.error("Directions failed:", status);
              setError(true);
              setLoading(false);
            }
          }
        );
      } catch (err) {
        console.error("Map init failed:", err);
        setError(true);
        setLoading(false);
      }
    }

    initMap();
    return () => { cancelled = true; };
  }, [from, to]);

  const [expanded, setExpanded] = useState(false);

  const openGoogleMapsDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from + ", India")}&destination=${encodeURIComponent(to + ", India")}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Map Container */}
      <div className={`relative w-full transition-all duration-300 ${expanded ? "h-[500px]" : "h-72"}`}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Loading state */}
        {loading && !error && (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-[28px] text-teal-600 animate-spin">
                progress_activity
              </span>
              <p className="text-xs text-slate-500 mt-1">Loading route...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
            <div className="text-center px-4">
              <span className="material-symbols-outlined text-[28px] text-slate-400">map</span>
              <p className="text-xs text-slate-500 mt-1">Route map unavailable</p>
            </div>
          </div>
        )}

        {/* Top bar — route badge + expand */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="bg-slate-900/85 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg pointer-events-none">
            {from} → {to}
          </span>
          <button
            type="button"
            onClick={() => {
              setExpanded(!expanded);
              // Trigger map resize after animation
              setTimeout(() => {
                if (mapInstanceRef.current) {
                  google.maps.event.trigger(mapInstanceRef.current, "resize");
                }
              }, 350);
            }}
            className="bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-medium px-2 py-1.5 rounded-lg flex items-center gap-1 hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">
              {expanded ? "fullscreen_exit" : "fullscreen"}
            </span>
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>

        {/* Get Directions button */}
        {!loading && !error && (
          <div className="absolute bottom-3 left-3">
            <button
              type="button"
              onClick={openGoogleMapsDirections}
              className="bg-white shadow-md text-slate-800 text-[11px] font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-teal-50 hover:text-teal-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-teal-600">directions</span>
              Get Directions
            </button>
          </div>
        )}
      </div>

      {/* Route Info Bar */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-teal-600 rounded-full" />
              <span className="text-[11px] text-slate-500">Onward</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-amber-500" />
              <span className="text-[11px] text-slate-500">Return</span>
            </div>
          </div>
          {routeInfo && (
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-500">
                <span className="font-bold text-slate-800">{routeInfo.distance}</span> driving
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">
                <span className="font-bold text-slate-800">{routeInfo.duration}</span> approx
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
