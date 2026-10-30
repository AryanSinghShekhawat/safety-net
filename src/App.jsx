import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useRealtime } from './hooks/useRealtime';
import { calculateDistance } from './utils/distance';
import ReportForm from './components/ReportForm';
import AdminDashboard from './AdminDashboard'; 

export default function App() {
  // State to toggle between public user view and admin view
  const [view, setView] = useState('user'); 

  const { incidents, upvoteIncident } = useRealtime();
  
  const userLat = 26.9124;
  const userLng = 75.7873;

  const sortedIncidents = incidents
    .map(incident => ({
      ...incident,
      distanceAway: parseFloat(calculateDistance(userLat, userLng, incident.lat, incident.lng))
    }))
    .sort((a, b) => a.distanceAway - b.distanceAway);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <Toaster position="top-right" />
      
      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button 
          onClick={() => setView('user')}
          style={{ background: view === 'user' ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          Public Map View
        </button>
        <button 
          onClick={() => setView('admin')}
          style={{ background: view === 'admin' ? '#007bff' : '#ccc', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
        >
          Admin Dashboard
        </button>
      </div>

      {/* Conditional Rendering: Show Admin Dashboard OR Public View */}
      {view === 'admin' ? (
        <AdminDashboard />
      ) : (
        <div>
          <h2>Nearby Incidents 📍</h2>
          
          <ReportForm />

          <p>Total reports loaded: {sortedIncidents.length}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {sortedIncidents.map((incident) => (
              <div key={incident.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>{incident.category}</h3>
                <div style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
                  <p style={{ margin: '4px 0' }}>📍 <strong>{incident.distanceAway} km away</strong></p>
                  <p style={{ margin: '4px 0' }}>Status: {incident.resolved ? '✅ Resolved' : '❌ Active'}</p>
                  <p style={{ margin: '4px 0' }}>Upvotes: {incident.upvotes}</p>
                </div>
                <button 
                  onClick={() => upvoteIncident(incident.id, incident.upvotes)}
                  style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Confirm Still Happening (Upvote)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}