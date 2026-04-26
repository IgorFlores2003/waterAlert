import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Add a request interceptor to include the JWT token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: (data: any) => client.post('/auth/login', data),
  signup: (data: any) => client.post('/auth/signup', data),
  verifyEmail: (data: { email: string, code: string }) => client.post('/auth/verify', data),

  // Profile
  updateProfile: (data: { name: string; weight: number; height: number; age: number }) => 
    client.put('/users/profile', data),

  // Water Intake
  resetProgress: () => 
    client.delete('/users/progress/today'),
  
  logIntake: (amountMl: number) => 
    client.post('/intake', { amount_ml: amountMl }),
  
  getProgress: () => 
    client.get('/users/progress'),
};
