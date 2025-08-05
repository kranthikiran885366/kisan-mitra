import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base URL and common headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // Login with email/phone and password
  login: async (credentials: { email?: string; phone?: string; password: string }) => {
    console.log('Login request payload:', JSON.stringify(credentials, null, 2));
    
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login successful, response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login API error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        request: {
          method: error.config?.method,
          url: error.config?.url,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });
      
      // Add more specific error messages based on the response
      if (error.response) {
        if (error.response.status === 400) {
          error.message = error.response.data?.message || 'Invalid credentials. Please check your email/phone and password.';
        } else if (error.response.status === 401) {
          error.message = 'Authentication failed. Please check your credentials and try again.';
        } else if (error.response.status >= 500) {
          error.message = 'Server error. Please try again later.';
        }
      }
      
      throw error;
    }
  },

  // Register a new user
  register: async (userData: {
    name: string;
    mobile: string;
    email?: string;
    password: string;
    state?: string;
    district?: string;
    village?: string;
    role?: string;
    landSize?: number;
    primaryCrop?: string;
    preferredLanguage?: string;
  }) => {
    console.log('Sending registration request to:', `${API_BASE_URL}/auth/register`);
    console.log('Request payload:', JSON.stringify(userData, null, 2));
    
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Registration API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        request: error.request,
        config: error.config
      });
      
      // Re-throw the error to be handled by the caller
      throw error;
    }
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
