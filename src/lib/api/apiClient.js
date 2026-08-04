import axios from 'axios'

const API_URL = 'http://localhost:5050/do'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})


   api.interceptors.request.use(
    (config) => {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          const token = parsed?.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error('Error parsing auth token:', e);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );