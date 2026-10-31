import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useRealtime() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // 1. Initial Fetch
    const fetchInitial = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setIncidents(data);
    };

    fetchInitial();

    // 2. Listen to INSERT, UPDATE, and DELETE events with a unique channel name
    const channelName = `realtime-incidents-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incidents' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIncidents((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIncidents((prev) =>
              prev.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setIncidents((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Upvote function with instant UI update
  const upvoteIncident = async (id, currentUpvotes = 0) => {
    const nextUpvotes = Number(currentUpvotes || 0) + 1;

    setIncidents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: nextUpvotes } : item))
    );

    const { error } = await supabase
      .from('incidents')
      .update({ upvotes: nextUpvotes })
      .eq('id', id);

    if (error) {
      console.error('Upvote failed:', error.message);
      toast.error('Could not save upvote');
    } else {
      toast.success('Confirmed! Upvote counted.');
    }
  };

  return { incidents, upvoteIncident };
}