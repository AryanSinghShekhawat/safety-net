import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { calculateHealthScore } from './lib/clustering';

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [healthScore, setHealthScore] = useState(100);

  const fetchIncidents = async () => {
    const { data } = await supabase
      .from('incidents')
      .select('*')
      .eq('resolved', false);
    
    if (data) {
      setIncidents(data);
      setHealthScore(calculateHealthScore(data));
    }
  };

  useEffect(() => {
    fetchIncidents();

    // Listen for realtime database changes to automatically update the score and table
    const subscription = supabase
      .channel('incidents_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const handleResolve = async (id) => {
    await supabase
      .from('incidents')
      .update({ resolved: true })
      .eq('id', id);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <h2>City Health Score: {healthScore}</h2>
      
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Upvotes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.id}>
              <td>{inc.id}</td>
              <td>{inc.category}</td>
              <td>{inc.upvotes}</td>
              <td>
                <button onClick={() => handleResolve(inc.id)}>Resolve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}