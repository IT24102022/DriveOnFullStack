import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ── Change this to your deployed backend URL ──────────────────────────────────
export const BASE_URL = 'http://192.168.8.152:5000';
// For local testing use: 'http://192.168.x.x:5000'  (your PC's local IP)
// ─────────────────────────────────────────────────────────────────────────────

const api = axios.create({ baseURL: `${BASE_URL}/api` });

// Attach JWT token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser  = (data) => api.post('/auth/register', data);
export const loginUser     = (data) => api.post('/auth/login', data);
export const getProfile    = ()     => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// ── Sessions ──────────────────────────────────────────────────────────────────
export const getSessions      = ()     => api.get('/sessions');
export const getSessionById   = (id)   => api.get(`/sessions/${id}`);
export const createSession    = (data) => api.post('/sessions', data);
export const updateSession    = (id, data) => api.put(`/sessions/${id}`, data);
export const deleteSession    = (id)   => api.delete(`/sessions/${id}`);

// ── Instructors ───────────────────────────────────────────────────────────────
export const getInstructors     = ()         => api.get('/instructors');
export const getInstructorById  = (id)       => api.get(`/instructors/${id}`);
export const createInstructor   = (formData) => api.post('/instructors', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateInstructor   = (id, formData) => api.put(`/instructors/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteInstructor   = (id) => api.delete(`/instructors/${id}`);

// ── Vehicles ──────────────────────────────────────────────────────────────────
export const getVehicles    = ()         => api.get('/vehicles');
export const getVehicleById = (id)       => api.get(`/vehicles/${id}`);
export const createVehicle  = (formData) => api.post('/vehicles', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateVehicle  = (id, formData) => api.put(`/vehicles/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteVehicle  = (id) => api.delete(`/vehicles/${id}`);

// ── Payments ──────────────────────────────────────────────────────────────────
export const getPayments    = ()         => api.get('/payments');
export const createPayment  = (formData) => api.post('/payments', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updatePayment  = (id, data) => api.put(`/payments/${id}`, data);
export const deletePayment  = (id)       => api.delete(`/payments/${id}`);

// ── Quizzes ───────────────────────────────────────────────────────────────────
export const getQuizzes   = ()   => api.get('/quizzes');
export const getQuizById  = (id) => api.get(`/quizzes/${id}`);

// ── Progress ──────────────────────────────────────────────────────────────────
export const getProgress        = ()       => api.get('/progress');
export const submitProgress     = (data)   => api.post('/progress', data);
export const getProgressByQuiz  = (quizId) => api.get(`/progress/quiz/${quizId}`);

export default api;
