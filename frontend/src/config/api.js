// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // User endpoints
  USERS: `${API_BASE_URL}/users`,
  LOGIN: `${API_BASE_URL}/users/login`,
  REGISTER: `${API_BASE_URL}/users/register`,
  
  // Doctor endpoints
  DOCTORS: `${API_BASE_URL}/doctors`,
  DOCTOR_VERIFY: `${API_BASE_URL}/doctors/verify`,
  
  // Appointment endpoints
  APPOINTMENTS: `${API_BASE_URL}/appointments`,
  
  // Document endpoints
  DOCUMENTS: `${API_BASE_URL}/documents`,
  
  // Message endpoints
  MESSAGES: `${API_BASE_URL}/messages`,
};

export const getApiUrl = (endpoint) => {
  return endpoint;
};

export default API_BASE_URL;
