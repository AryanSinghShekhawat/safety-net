import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useRealtime } from './hooks/useRealtime';
import ReportForm from './components/ReportForm';
import AdminDashboard from './AdminDashboard';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Vite marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Forces Leaflet to recalculate its container size so grey gaps disappear
function MapFixer({ center }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (center) map.setView(center, map.getZoom());
    }, 150);
    return () => clearTimeout(timer);
  }, [map, center]);
  return null;
}

const getIcon = (category = '') => {
  const lower = category.toLowerCase();
  if (lower.includes('pothole')) return '🕳️';
  if (lower.includes('light')) return '💡';
  if (lower.includes('water')) return '💧';
  return '⚠️';
};

export default function App() {
  const [view, setView] = useState('user');
  const [activeTab, setActiveTab] = useState('nearby');
  const { incidents = [], upvoteIncident } = useRealtime();

  const defaultLat = 26.9124;
  const defaultLng = 75.7873;

  const activeIncidents = incidents.filter((i) => !i.resolved);
  const healthScore = Math.max(0, 100 - activeIncidents.length * 5);

  // Center map on the newest valid incident, or fallback to Jaipur
  const validPins = activeIncidents.filter(
    (i) => i.lat && i.lng && Math.abs(i.lat) <= 90 && Math.abs(i.lng) <= 180
  );
  const mapCenter =
    validPins.length > 0
      ? [Number(validPins[0].lat), Number(validPins[0].lng)]
      : [defaultLat, defaultLng];

  if (view === 'admin') {
    return <AdminDashboard onBack={() => setView('user')} />;
  }

  return (
    <div className="bg-gray-200 flex flex-col items-center justify-center min-h-screen font-sans">
      <Toaster position="top-center" />

      <button
        onClick={() => setView('admin')}
        className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold z-50 shadow-xl"
      >
        Admin View
      </button>

      <div className="w-full max-w-md bg-gray-50 h-[800px] max-h-screen shadow-2xl relative flex flex-col overflow-hidden sm:rounded-[2.5rem] sm:border-8 border-gray-900">
        <header className="bg-white p-4 shadow-sm z-10 flex justify-between items-center shrink-0">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">Hyperlocal Safety System</h1>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-tight">
              Health
              <br />
              Score
            </div>
            <div
              className={`w-11 h-11 rounded-full border-[4px] flex items-center justify-center font-bold text-sm ${
                healthScore > 70
                  ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
                  : 'border-red-400 text-red-600 bg-red-50'
              }`}
            >
              {healthScore}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-4 relative bg-gray-50">
          {activeTab === 'nearby' ? (
            <div>
              <div className="h-56 w-full relative shadow-inner overflow-hidden z-0">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '224px', width: '100%' }}
                  zoomControl={false}
                >
                  <MapFixer center={mapCenter} />
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {validPins.map((incident) => (
                    <Marker
                      key={incident.id}
                      position={[Number(incident.lat), Number(incident.lng)]}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong className="capitalize text-sm block">
                            {incident.category}
                          </strong>
                          <span className="text-xs text-gray-500">
                            Upvotes: {incident.upvotes}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <div className="p-4 space-y-4 -mt-4 relative z-10">
                {activeIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="bg-white p-5 rounded-2xl shadow-sm border-l-[6px] border-blue-500"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-50 p-3 rounded-xl text-2xl shadow-sm">
                          {getIcon(incident.category)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize">
                            {incident.category}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 font-medium">
                            #{String(incident.id).slice(0, 6)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => upvoteIncident(incident.id, incident.upvotes)}
                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-100 transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        {incident.upvotes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white h-full">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Report an Issue</h2>
              <ReportForm onComplete={() => setActiveTab('nearby')} />
            </div>
          )}
        </main>

        <nav className="w-full bg-white border-t border-gray-100 flex justify-around p-3 pb-6 sm:pb-4 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center transition ${
              activeTab === 'report' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-bold tracking-wide">REPORT</span>
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex flex-col items-center transition ${
              activeTab === 'nearby' ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-[10px] font-bold tracking-wide">NEARBY</span>
          </button>
        </nav>
      </div>
    </div>
  );
}