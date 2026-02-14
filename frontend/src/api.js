import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const googleCallback = (session_id) => api.post('/auth/google/callback', { session_id });
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Courts
export const getCourts = () => api.get('/courts');
export const getCourt = (courtId) => api.get(`/courts/${courtId}`);

// Bookings
export const getAvailability = (courtId, date) => api.get(`/bookings/availability?court_id=${courtId}&date=${date}`);
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getBooking = (bookingId) => api.get(`/bookings/${bookingId}`);
export const cancelBooking = (bookingId) => api.patch(`/bookings/${bookingId}/cancel`);

// Payments
export const createCheckout = (data) => api.post('/payments/checkout', data);
export const getPaymentStatus = (sessionId) => api.get(`/payments/status/${sessionId}`);

// Reviews
export const createReview = (data) => api.post('/reviews', data);
export const getCourtReviews = (courtId) => api.get(`/reviews/${courtId}`);

// Admin
export const getAllBookings = (status) => api.get(`/admin/bookings${status ? `?status=${status}` : ''}`);
export const getAllUsers = () => api.get('/admin/users');
export const getAdminStats = () => api.get('/admin/stats');

export default api;