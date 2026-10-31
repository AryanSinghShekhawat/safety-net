import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminDashboard({ incidents = [], onBack }) {
  const [isSeeding, setIsSeeding] = useState(false);

  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const activeIncidents = safeIncidents.filter((i) => i && !i.resolved);
  const resolvedIncidents = safeIncidents.filter((i) => i && i.resolved);
  const criticalCount = activeIncidents.filter((i) => Number(i?.upvotes || 0) >= 3).length;
  const healthScore = Math.max(0, 100 - activeIncidents.length * 5);

  const handleResolve = async (id) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ resolved: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Incident marked as resolved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to resolve incident');
    }
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const demoRows = [
        { category: 'Pothole', lat: 26.9142, lng: 75.7851, upvotes: 4, resolved: false },
        { category: 'Broken Streetlight', lat: 26.9098, lng: 75.7912, upvotes: 2, resolved: false },
        { category: 'Water Issue', lat: 26.9155, lng: 75.7895, upvotes: 5, resolved: false },
      ];
      const { error } = await supabase.from('incidents').insert(demoRows);
      if (error) throw error;
      toast.success('3 realistic Jaipur incidents deployed!');
    } catch (err) {
      console.error(err);
      toast.error('Could not seed demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  const formatCoord = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num.toFixed(4) : '0.0000';
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-6 md:p-10 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">
              Municipal Operations Portal
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              Hyperlocal Safety Command Center
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeedDemo}
              disabled={isSeeding}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {isSeeding ? 'Deploying...' : '⚡ Seed Demo Data'}
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              ← Return to Live Map
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="text-xs font-bold uppercase text-slate-400">Sector Health Index</div>
            <div className="text-4xl font-black text-emerald-400 mt-2">{healthScore}/100</div>
            <div className="text-xs text-slate-500 mt-1">Auto-adjusted via live telemetry</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="text-xs font-bold uppercase text-slate-400">Active Hazards</div>
            <div className="text-4xl font-black text-white mt-2">{activeIncidents.length}</div>
            <div className="text-xs text-slate-500 mt-1">Awaiting municipal dispatch</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="text-xs font-bold uppercase text-slate-400">Critical Clusters</div>
            <div className="text-4xl font-black text-rose-400 mt-2">{criticalCount}</div>
            <div className="text-xs text-slate-500 mt-1">3+ citizen confirmations</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="text-xs font-bold uppercase text-slate-400">Resolved Issues</div>
            <div className="text-4xl font-black text-blue-400 mt-2">{resolvedIncidents.length}</div>
            <div className="text-xs text-slate-500 mt-1">Cleared from public radar</div>
          </div>
        </div>

        {/* Incident Management Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-white text-base">Live Incident Triage Queue</h2>
            <span className="text-xs text-slate-400">{safeIncidents.length} total records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">Hazard Category</th>
                  <th className="p-4 font-bold">GPS Coordinates</th>
                  <th className="p-4 font-bold">Cluster Upvotes</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {safeIncidents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No incidents recorded yet. Click "Seed Demo Data" above to populate.
                    </td>
                  </tr>
                ) : (
                  safeIncidents.map((incident, idx) => (
                    <tr key={incident?.id || idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-bold text-white capitalize">
                        {incident?.category || 'Hazard'}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-400">
                        {formatCoord(incident?.lat)}° N, {formatCoord(incident?.lng)}° E
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            Number(incident?.upvotes || 0) >= 3
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          ▲ {incident?.upvotes || 1} Confirmed
                        </span>
                      </td>
                      <td className="p-4">
                        {incident?.resolved ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                            ✔ Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-xs animate-pulse">
                            ● Active Hazard
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!incident?.resolved && (
                          <button
                            onClick={() => handleResolve(incident.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}