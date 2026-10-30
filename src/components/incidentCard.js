const getIcon = (category) => {
  if(category.includes('Pothole')) return '🕳️';
  if(category.includes('Streetlight')) return '💡';
  return '⚠️';
};

export const createIncidentCard = (incident) => {
  const card = document.createElement('div');
  card.className = `bg-white p-5 rounded-2xl shadow-sm border-l-[6px] ${incident.resolved ? 'border-gray-200 opacity-60' : 'border-blue-500'}`;
  
  card.innerHTML = `
    <div class="flex justify-between items-start">
      <div class="flex items-center gap-4">
        <div class="bg-gray-50 p-3 rounded-xl text-2xl shadow-sm">
          ${getIcon(incident.category)}
        </div>
        <div>
          <h3 class="font-bold text-gray-900 text-lg leading-tight">${incident.category}</h3>
          <p class="text-xs text-gray-400 mt-1 font-medium">${incident.created_at} • ${incident.id}</p>
        </div>
      </div>
      <button class="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7"></path></svg>
        ${incident.upvotes}
      </button>
    </div>
    ${!incident.resolved ? `
    <div class="mt-5">
      <button class="w-full bg-gray-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-800 transition active:scale-[0.98]">
        Confirm Presence
      </button>
    </div>` : ''}
  `;
  return card;
};