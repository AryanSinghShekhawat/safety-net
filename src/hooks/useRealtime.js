import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtime() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (data) setIncidents(data);
    };
    fetchInitialData();

    const channel = supabase
      .channel('public:incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        if (payload.eventType === 'INSERT') setIncidents((current) => [payload.new, ...current]);
        else if (payload.eventType === 'UPDATE') setIncidents((current) => current.map(inc => inc.id === payload.new.id ? payload.new : inc));
        else if (payload.eventType === 'DELETE') setIncidents((current) => current.filter(inc => inc.id !== payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Backend logic for incrementing upvotes
  const upvoteIncident = async (id, currentUpvotes) => {
    const { error } = await supabase
      .from('incidents')
      .update({ upvotes: currentUpvotes + 1 })
      .eq('id', id);
    if (error) console.error("Error upvoting:", error);
  };

  return { incidents, upvoteIncident };
}