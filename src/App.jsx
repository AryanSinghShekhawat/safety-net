import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useRealtime } from './hooks/useRealtime';
import { calculateDistance } from './utils/distance';
import ReportForm from './components/ReportForm';
import AdminDashboard from './AdminDashboard';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const getCategoryMeta = (category = '') => {
  const lower = category.toLowerCase();
  if (lower.includes('pothole')) return { icon: '🕳️', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (lower.includes('light')) return { icon: '💡', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
  if (lower.includes('water')) return { icon: '💧', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
  if (lower.includes('power')) return { icon: '⚡', badge: 'bg-purple-50 text-purple-700 border-purple-200' };
  return { icon: '⚠️', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
};

const createCustomIcon = (category, upvotes) => {
  const { icon } = getCategoryMeta(category);
  const isHighPriority = Number(upvotes) >= 3;
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div class="pin-pulse" style="background: ${isHighPriority ? 'rgba(225, 29, 72, 0.45)' : 'rgba(37, 99, 235, 0.35)'}"></div>
      <div class="pin-core" style="background: ${isHighPriority ? '#e11d48' : '#0f172a'}">${icon}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (center) map.flyTo(center, zoom || 14, { duration: 1.2 });
    }, 100);
    return () => clearTimeout(timer);
  }, [map, center, zoom]);
  return null;
}

export default function App() {
  const [view, setView] = useState('user');
  const [activeTab, setActiveTab] = useState('nearby');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [focusedCoords, setFocusedCoords] = useState(null);

  const { incidents = [], upvoteIncident } = useRealtime();

  const [userCoords, setUserCoords] = useState({ lat: 26.9124, lng: 75.7873 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { } // Keep Jaipur fallback if permission denied
      );
    }
  }, []);

  const userLat = userCoords.lat;
  const userLng = userCoords.lng;

  const activeIncidents = incidents
    .filter((i) => !i.resolved)
    .map((incident) => ({
      ...incident,
      distanceAway: calculateDistance
        ? parseFloat(calculateDistance(userLat, userLng, incident.lat, incident.lng))
        : 0.4,
    }))
    .sort((a, b) => a.distanceAway - b.distanceAway);

  const filteredIncidents =
    selectedCategory === 'All'
      ? activeIncidents
      : activeIncidents.filter((i) => i.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const healthScore = Math.max(0, 100 - activeIncidents.length * 5);

  const validPins = filteredIncidents.filter(
    (i) => i.lat && i.lng && Math.abs(i.lat) <= 90 && Math.abs(i.lng) <= 180
  );

  const mapCenter = focusedCoords
    ? focusedCoords
    : validPins.length > 0
      ? [Number(validPins[0].lat), Number(validPins[0].lng)]
      : [userLat, userLng];

  if (view === 'admin') {
    return <AdminDashboard incidents={incidents} onBack={() => setView('user')} />;
  }

  const categories = ['All', 'Pothole', 'Streetlight', 'Water', 'Power', 'Hazard'];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 font-sans text-slate-900">
      <Toaster position="top-right" />

      {/* Top Enterprise Navigation Bar */}
      {/* Top Enterprise Navigation Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Dynamic Radar Shield & Telemetry Logo Mark */}
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/5">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Radar circular sweeps */}
              <circle cx="12" cy="12" r="9" className="stroke-blue-500/30" />
              <path d="M12 3a9 9 0 0 1 9 9" className="stroke-blue-400 animate-pulse" />
              <circle cx="12" cy="12" r="5" className="stroke-blue-500/50" />
              
              {/* Shield outline */}
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="stroke-blue-400" />
              
              {/* GPS target map marker & pulse inside shield */}
              <path d="M12 7c-1.5 0-3 1.2-3 2.5 0 2 3 5.5 3 5.5s3-3.5 3-5.5C15 8.2 13.5 7 12 7z" fill="currentColor" className="text-blue-500" />
              <circle cx="12" cy="9.5" r="1" fill="white" />
              
              {/* Connecting tech telemetry lines */}
              <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" className="stroke-blue-500/30" />
              <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" className="stroke-blue-500/30" />
            </svg>
          </div>
          
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-extrabold text-white text-base md:text-lg tracking-tight leading-none">
                Hyperlocal Safety System
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                TELEMETRY ACTIVE
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
              Real-Time Civic Dispatch & Auto-Clustered Incident Network • Jaipur Sector
            </p>
          </div>
        </div>

        {/* Right Telemetry Metrics & Mode Switcher */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Zone Health Index
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {activeIncidents.length} Active Hazards
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border ${
                healthScore > 75
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : healthScore > 45
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {healthScore}
            </div>
          </div>

          <button
            onClick={() => setView('admin')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            ⚙️ Command Center
          </button>
        </div>
      </header>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Control Panel (Feed + Form) */}
        <aside className="w-full lg:w-[440px] xl:w-[480px] bg-white border-r border-slate-200 flex flex-col h-[55%] lg:h-full z-20 shadow-2xl order-2 lg:order-1">
          {/* Action Switcher */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('nearby')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'nearby'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
            >
              📡 Live Feed ({activeIncidents.length})
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'report'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
            >
              ➕ Raise Report
            </button>
          </div>

          {activeTab === 'nearby' ? (
            <>
              {/* Category Filter Pills */}
              <div className="px-4 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto shrink-0 bg-white">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Incident Feed List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {filteredIncidents.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="font-bold text-slate-800 text-base">All Clear in This Sector</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No active incidents match your filter. Raise a report to alert nearby citizens.
                    </p>
                  </div>
                ) : (
                  filteredIncidents.map((incident) => {
                    const { icon, badge } = getCategoryMeta(incident.category);
                    const isCritical = Number(incident.upvotes) >= 3;

                    return (
                      <div
                        key={incident.id}
                        onClick={() =>
                          incident.lat &&
                          incident.lng &&
                          setFocusedCoords([Number(incident.lat), Number(incident.lng)])
                        }
                        className="group bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-500/60 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-xl shrink-0 transition">
                              {icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-sm capitalize">
                                  {incident.category}
                                </h3>
                                {isCritical && (
                                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                                    Critical Cluster
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                                <span>📍 {incident.distanceAway || '0.3'} km away</span>
                                <span>•</span>
                                <span className="font-mono text-[11px] text-slate-400">
                                  #{String(incident.id).slice(0, 5)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Upvote / Confirm Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              upvoteIncident(incident.id, incident.upvotes);
                            }}
                            className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                            title="Confirm this hazard is still active"
                          >
                            <span>▲</span>
                            <span>{incident.upvotes || 1}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="mb-6">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  Geo-Verified Dispatch
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                  Report a Neighborhood Hazard
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Duplicate reports within 300m are automatically clustered using Haversine telemetry.
                </p>
              </div>
              <ReportForm onComplete={() => setActiveTab('nearby')} />
            </div>
          )}
        </aside>

        {/* Right Interactive Live Map */}
        <main className="flex-1 h-[45%] lg:h-full relative z-10 order-1 lg:order-2">
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <MapController center={mapCenter} zoom={focusedCoords ? 16 : 14} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User 500m Monitoring Radar Circle */}
            <Circle
              center={[userLat, userLng]}
              radius={600}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4 4',
              }}
            />

            {/* Live Clustered Incident Markers */}
            {validPins.map((incident) => (
              <Marker
                key={incident.id}
                position={[Number(incident.lat), Number(incident.lng)]}
                icon={createCustomIcon(incident.category, incident.upvotes)}
              >
                <Popup>
                  <div className="p-1 min-w-[150px]">
                    <div className="text-xs font-bold uppercase text-blue-600 mb-0.5">
                      Verified Incident
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm capitalize">
                      {incident.category}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex justify-between items-center">
                      <span>Confirmations: <strong>{incident.upvotes || 1}</strong></span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Map Legend Overlay */}
          <div className="absolute bottom-5 right-5 z-[400] bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/80 hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-white inline-block" />
              <span className="text-slate-300 font-medium">Standard Report</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 border-2 border-white inline-block" />
              <span className="text-slate-300 font-medium">Critical Cluster (3+ Upvotes)</span>
            </div>
            <button
              onClick={() => setFocusedCoords([userLat, userLng])}
              className="ml-2 bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
            >
              Recenter Radar
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}