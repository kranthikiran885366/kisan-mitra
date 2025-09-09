import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const apiCall = async (endpoint: string, options: any = {}) => {
  try {
    const response = await api({
      url: endpoint,
      method: 'GET',
      ...options
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const authApi = {
  login: async (credentials: { email?: string; phone?: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          error.message = error.response.data?.message || 'Invalid credentials';
        } else if (error.response.status === 401) {
          error.message = 'Authentication failed';
        } else if (error.response.status >= 500) {
          error.message = 'Server error';
        }
      }
      throw error;
    }
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const weatherApi = {
  getCurrent: (lat: number, lon: number) => apiCall(`/weather/current?lat=${lat}&lon=${lon}`),
  getForecast: (lat: number, lon: number) => apiCall(`/weather/forecast?lat=${lat}&lon=${lon}`),
  getAlerts: () => apiCall('/weather/alerts')
};

export const marketApi = {
  getPrices: () => apiCall('/market/prices'),
  getTrends: () => apiCall('/market/trends'),
  getAnalysis: () => apiCall('/market/analysis')
};

export const marketplaceApi = {
  sell: (data: any) => apiCall('/marketplace/sell', { method: 'POST', data }),
  getProducts: () => apiCall('/marketplace/products'),
  negotiate: (data: any) => apiCall('/marketplace/negotiate', { method: 'POST', data })
};

export const cropsApi = {
  getRecommendations: (params: any) => apiCall(`/crops/recommendations?${new URLSearchParams(params)}`),
  scanDisease: (data: any) => apiCall('/disease/detect', { method: 'POST', data }),
  getGuidance: () => apiCall('/crops/guidance')
};

export const communityApi = {
  getPosts: () => apiCall('/community/posts'),
  createPost: (data: any) => apiCall('/community/posts', { method: 'POST', data }),
  getGroups: () => apiCall('/community/groups')
};

export const expertApi = {
  getExperts: () => apiCall('/expert'),
  bookConsultation: (data: any) => apiCall('/expert/consultation', { method: 'POST', data }),
  getMessages: (id: string) => apiCall(`/expert/messages?consultationId=${id}`),
  sendMessage: (data: any) => apiCall('/expert/message', { method: 'POST', data })
};

export const schemesApi = {
  getSchemes: () => apiCall('/schemes'),
  getScheme: (id: string) => apiCall(`/schemes/${id}`),
  apply: (data: any) => apiCall('/schemes/apply', { method: 'POST', data })
};

export const userApi = {
  getProfile: () => apiCall('/user/profile'),
  updateProfile: (data: any) => apiCall('/user/profile', { method: 'PUT', data }),
  getSettings: () => apiCall('/user/settings')
};

export const alertsApi = {
  getAlerts: () => apiCall('/alerts'),
  markRead: (id: string) => apiCall(`/alerts/${id}/read`, { method: 'PUT' })
};

export const uploadApi = {
  uploadImage: (formData: FormData) => apiCall('/upload/image', { 
    method: 'POST', 
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;