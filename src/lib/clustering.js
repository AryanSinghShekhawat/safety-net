import { supabase } from './supabaseClient';

const R = 6371000; // Earth radius in meters

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findOrCreateIncident(category, lat, lng) {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  const { data: candidates } = await supabase
    .from('incidents')
    .select('*')
    .eq('category', category)
    .eq('resolved', false)
    .gte('created_at', fourHoursAgo);

  if (candidates) {
    for (const inc of candidates) {
      if (haversine(lat, lng, inc.lat, inc.lng) <= 200) {
        // Merge: increment upvotes
        await supabase
          .from('incidents')
          .update({ upvotes: inc.upvotes + 1 })
          .eq('id', inc.id);
        return inc.id;
      }
    }
  }

  // No match: create new incident
  const { data: newInc } = await supabase
    .from('incidents')
    .insert({ category, lat, lng, upvotes: 1 })
    .select()
    .single();
  return newInc.id;
}

export function calculateHealthScore(incidents) {
  let score = 100;
  const now = Date.now();
  for (const inc of incidents) {
    if (inc.resolved) continue;
    score -= 5; // Each unresolved incident deducts 5 points
    const ageHours = (now - new Date(inc.created_at).getTime()) / 3600000;
    if (ageHours > 24) score -= 10; // Over 24 hours unresolved deducts 10 points
  }
  return Math.max(0, Math.round(score));
}

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}