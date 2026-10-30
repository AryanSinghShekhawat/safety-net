// Import your database logic (Adjust path if needed)
import { getIncidents } from './lib/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Load Data
  // In a real app, this is: const incidents = await supabase.from('incidents').select('*').eq('resolved', false)
  let activeIncidents = getIncidents().filter(inc => !inc.resolved);

  const tableBody = document.getElementById('admin-table-body');
  const btnSeed = document.getElementById('btn-seed');

  // 2. Render Loop
  const render = () => {
    tableBody.innerHTML = '';
    
    let penaltyScore = 0;
    const now = new Date();

    activeIncidents.forEach(incident => {
      // Time calculations
      const createdDate = new Date(incident.created_at || now);
      const hoursOld = Math.floor((now - createdDate) / (1000 * 60 * 60));
      const isCritical = hoursOld > 24;

      // Score Penalty Logic (5 per incident, extra 10 if > 24 hrs)
      penaltyScore += 5;
      if (isCritical) penaltyScore += 10;

      // Row Creation
      const tr = document.createElement('tr');
      tr.className = "hover:bg-gray-50 transition";
      tr.innerHTML = `
        <td class="p-4 font-medium flex items-center gap-2">
          ${getIcon(incident.category)} ${incident.category}
        </td>
        <td class="p-4 text-gray-600 text-sm">
          ${Number(incident.lat).toFixed(3)}, ${Number(incident.lng).toFixed(3)}
        </td>
        <td class="p-4 font-semibold text-gray-700">
          ${incident.upvotes || 0}
        </td>
        <td class="p-4 font-bold ${isCritical ? 'text-red-500' : 'text-gray-500'}">
          ${hoursOld} hrs ago
        </td>
        <td class="p-4">
          <button data-id="${incident.id}" class="resolve-btn px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded shadow hover:bg-blue-700 transition">
            Resolve
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Apply Health Score
    let finalScore = Math.max(0, 100 - penaltyScore);
    updateScoreUI(finalScore, activeIncidents.length);
    attachResolveListeners();
  };

  // 3. Resolve Button Logic (Optimistic UI Update)
  const attachResolveListeners = () => {
    document.querySelectorAll('.resolve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        
        // Optimistic UI: Immediately remove from local array & re-render
        activeIncidents = activeIncidents.filter(inc => inc.id !== id);
        render();

        // Backend call (Fire and forget for speed)
        // supabase.from('incidents').update({ resolved: true }).eq('id', id);
        console.log(`Incident ${id} marked as resolved in DB`);
      });
    });
  };

  // 4. Score Color Logic
  const updateScoreUI = (score, count) => {
    const scoreEl = document.getElementById('admin-score');
    const subtextEl = document.getElementById('admin-subtext');
    
    scoreEl.innerText = score;
    subtextEl.innerText = `Based on ${count} unresolved incidents.`;

    scoreEl.className = "text-6xl font-black w-32 h-32 flex items-center justify-center rounded-full border-8 transition-colors duration-300";
    
    if (score >= 80) {
      scoreEl.classList.add('text-emerald-500', 'border-emerald-400', 'bg-emerald-50');
    } else if (score >= 50) {
      scoreEl.classList.add('text-yellow-500', 'border-yellow-400', 'bg-yellow-50');
    } else {
      scoreEl.classList.add('text-red-500', 'border-red-400', 'bg-red-50');
    }
  };

  // 5. Seed Button
  if (btnSeed) {
    btnSeed.addEventListener('click', () => {
      console.log("Seeding demo data into Supabase...");
      // Add fake items to activeIncidents or trigger supabase insert here
      alert("Demo data seeded! Refreshing table.");
      location.reload(); 
    });
  }

  // Helper Icon Generator
  function getIcon(category) {
    const icons = { 'Pothole': '🕳️', 'Broken Streetlight': '💡', 'Water Leak': '💧', 'Stray Animal': '🐕' };
    return icons[category] || '⚠️';
  }

  // Initial Boot
  render();
});