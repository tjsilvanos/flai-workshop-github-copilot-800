import axios from 'axios';

// Determine the API base URL based on environment
const getBaseURL = () => {
  const codespace = process.env.REACT_APP_CODESPACE_NAME || process.env.CODESPACE_NAME;
  if (codespace) {
    console.log('Using Codespace URL with REACT_APP_CODESPACE_NAME:', codespace);
    return `https://${codespace}-8000.app.github.dev/api`;
  }
  console.log('Using localhost URL');
  return 'http://localhost:8000/api';
};

const baseURL = getBaseURL();
console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service methods
export const apiService = {
  // Users
  getUsers: () => api.get('/users/'),
  getUser: (id) => api.get(`/users/${id}/`),
  createUser: (data) => api.post('/users/', data),
  updateUser: (id, data) => api.put(`/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/users/${id}/`),

  // Teams
  getTeams: () => api.get('/teams/'),
  getTeam: (id) => api.get(`/teams/${id}/`),
  createTeam: (data) => api.post('/teams/', data),
  updateTeam: (id, data) => api.put(`/teams/${id}/`, data),
  deleteTeam: (id) => api.delete(`/teams/${id}/`),

  // Activities
  getActivities: () => api.get('/activities/'),
  getActivity: (id) => api.get(`/activities/${id}/`),
  createActivity: (data) => api.post('/activities/', data),
  updateActivity: (id, data) => api.put(`/activities/${id}/`, data),
  deleteActivity: (id) => api.delete(`/activities/${id}/`),

  // Leaderboard
  getLeaderboard: () => api.get('/leaderboard/'),

  // Workouts
  getWorkouts: () => api.get('/workouts/'),
  getWorkout: (id) => api.get(`/workouts/${id}/`),
  createWorkout: (data) => api.post('/workouts/', data),
  updateWorkout: (id, data) => api.put(`/workouts/${id}/`, data),
  deleteWorkout: (id) => api.delete(`/workouts/${id}/`),
};

export default api;
