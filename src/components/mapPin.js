export const createMapPin = (incident) => {
  if (incident.resolved) return null; // Don't show resolved issues on map
  
  const pin = document.createElement('div');
  pin.className = 'absolute w-5 h-5 bg-blue-600 rounded-full border-[3px] border-white shadow-lg animate-bounce';
  pin.style.top = `${incident.lat}%`;
  pin.style.left = `${incident.lng}%`;
  
  return pin;
};