export const getIncidents = () => {
  return [
    { id: 'INC-842', category: 'Pothole', lat: 35, lng: 45, created_at: '10m ago', resolved: false, upvotes: 42 },
    { id: 'INC-841', category: 'Broken Streetlight', lat: 65, lng: 70, created_at: '2h ago', resolved: false, upvotes: 18 },
    { id: 'INC-839', category: 'Accessibility Hazard', lat: 50, lng: 20, created_at: '1d ago', resolved: true, upvotes: 5 }
  ];
};