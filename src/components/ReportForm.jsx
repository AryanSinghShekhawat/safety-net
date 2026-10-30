import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ReportForm({ onComplete }) {
  const [category, setCategory] = useState('Pothole');
  const [locationDesc, setLocationDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallback center (Jaipur)
  const baseLat = 26.9124;
  const baseLng = 75.7873;

  // Helper to get real GPS or fallback with slight offset
  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          lat: baseLat + (Math.random() - 0.5) * 0.004,
          lng: baseLng + (Math.random() - 0.5) * 0.004,
        });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () =>
          resolve({
            lat: baseLat + (Math.random() - 0.5) * 0.004,
            lng: baseLng + (Math.random() - 0.5) * 0.004,
          }),
        { timeout: 3000 }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { lat, lng } = await getCoordinates();

      // 1. Check for existing active incidents of the same category to auto-cluster
      const { data: existing } = await supabase
        .from('incidents')
        .select('*')
        .eq('category', category)
        .eq('resolved', false);

      // Check if an active report of the same category is within ~300m (~0.003 degrees)
      const nearbyMatch = (existing || []).find(
        (inc) =>
          inc.lat &&
          inc.lng &&
          Math.abs(Number(inc.lat) - lat) < 0.003 &&
          Math.abs(Number(inc.lng) - lng) < 0.003
      );

      if (nearbyMatch) {
        // 2A. Auto-Cluster: Increment upvotes on the existing report
        const nextUpvotes = Number(nearbyMatch.upvotes || 0) + 1;
        const { error: updateError } = await supabase
          .from('incidents')
          .update({ upvotes: nextUpvotes })
          .eq('id', nearbyMatch.id);

        if (updateError) throw updateError;
        toast.success(`Merged with nearby ${category} report! (Upvotes: ${nextUpvotes})`);
      } else {
        // 2B. New Report: Insert with upvotes starting at 1
        const newReport = {
          category,
          lat,
          lng,
          resolved: false,
          upvotes: 1,
        };

        const { error: insertError } = await supabase.from('incidents').insert([newReport]);
        if (insertError) throw insertError;
        toast.success('New report submitted and pinned on map!');
      }

      setLocationDesc('');
      if (onComplete) onComplete(); // Automatically switch back to the Nearby Map tab
    } catch (error) {
      toast.error('Failed to submit report');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border-gray-200 rounded-xl shadow-sm p-4 bg-gray-50 border focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium"
        >
          <option value="Pothole">🕳️ Pothole</option>
          <option value="Broken Streetlight">💡 Broken Streetlight</option>
          <option value="Water Issue">💧 Water Issue</option>
          <option value="Power Cut">⚡ Power Cut</option>
          <option value="Road Hazard">⚠️ Road Hazard</option>
          <option value="Accessibility Hazard">♿ Accessibility Hazard</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Location Description (Optional)
        </label>
        <input
          type="text"
          value={locationDesc}
          onChange={(e) => setLocationDesc(e.target.value)}
          placeholder="e.g., Near Main Gate / 4th Ave"
          className="w-full border-gray-200 rounded-xl shadow-sm p-4 bg-gray-50 border focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-lg py-4 rounded-xl shadow-lg mt-4 active:scale-95 transition transform cursor-pointer"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
}