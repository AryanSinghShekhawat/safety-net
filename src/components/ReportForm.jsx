import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ReportForm() {
  const [category, setCategory] = useState('Hazard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated user location (Jaipur) with slight randomization for realistic plotting
  const baseLat = 26.9124;
  const baseLng = 75.7873;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newReport = {
      category: category,
      lat: baseLat + (Math.random() - 0.5) * 0.01,
      lng: baseLng + (Math.random() - 0.5) * 0.01,
      resolved: false,
      upvotes: 0
    };

    const { error } = await supabase.from('incidents').insert([newReport]);

    if (error) {
      toast.error('Failed to submit report');
      console.error(error);
    } else {
      toast.success('Report submitted successfully!');
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '2px dashed #007bff', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0 }}>🚨 Report New Incident</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '8px', flexGrow: 1, borderRadius: '4px' }}
        >
          <option value="Power Cut">Power Cut</option>
          <option value="Water Issue">Water Issue</option>
          <option value="Theft">Theft</option>
          <option value="Stray Animals">Stray Animals</option>
          <option value="Road Hazard">Road Hazard</option>
        </select>
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}