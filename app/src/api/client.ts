import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export const api = {
  registerUser: (data: { name: string; weight: number; height: number; age: number }) => 
    client.post('/users', data),
  
  getUserProfile: (id: string) => 
    client.get(`/users/${id}`),

  updateUser: (id: string, data: { name: string; weight: number; height: number; age: number }) => 
    client.put(`/users/${id}`, data),
  
  logIntake: (userId: number, amountMl: number) => 
    client.post('/intake', { user_id: userId, amount_ml: amountMl }),
  
  getProgress: (userId: number) => 
    client.get(`/users/${userId}/progress`),
};
