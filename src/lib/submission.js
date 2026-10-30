import { supabase } from './supabaseClient';
import { getUserLocation, findOrCreateIncident } from './clustering';

export async function submitReport(category) {
  try {
    // 1. Get user's current GPS location
    const { lat, lng } = await getUserLocation();

    // 2. Call your clustering engine (finds nearby active incident or creates a new one)
    const incidentId = await findOrCreateIncident(category, lat, lng);

    // 3. Insert a raw record into the 'reports' table with the linked incident_id
    const { error: reportError } = await supabase
      .from('reports')
      .insert({ incident_id: incidentId, category, lat, lng });

    if (reportError) throw reportError;

    console.log("Report submitted and linked to incident:", incidentId);
    return { success: true, incidentId };
  } catch (error) {
    console.error("Submission failed:", error.message);
    return { success: false, error: error.message };
  }
}