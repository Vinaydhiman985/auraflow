const API_URL = import.meta.env.VITE_API_URL || 'https://auraflow-backend-l0ya.onrender.com';

export const api = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return res.json();
};

export default API_URL;
