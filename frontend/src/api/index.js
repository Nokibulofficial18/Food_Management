import api from './axios';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data)
};

// Consumption APIs
export const consumptionAPI = {
  getLogs: (params) => api.get('/consumption', { params }),
  createLog: (data) => api.post('/consumption', data),
  getLogById: (id) => api.get(`/consumption/${id}`),
  updateLog: (id, data) => api.put(`/consumption/${id}`, data),
  deleteLog: (id) => api.delete(`/consumption/${id}`)
};

// Inventory APIs
export const inventoryAPI = {
  getInventory: (params) => api.get('/inventory', { params }),
  createItem: (data) => api.post('/inventory', data),
  getItemById: (id) => api.get(`/inventory/${id}`),
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/${id}`)
};

// Food APIs
export const foodAPI = {
  getFoodItems: (params) => api.get('/food', { params }),
  getFoodItemById: (id) => api.get(`/food/${id}`)
};

// Resource APIs
export const resourceAPI = {
  getResources: (params) => api.get('/resources', { params }),
  getResourceById: (id) => api.get(`/resources/${id}`)
};

// Upload APIs
export const uploadAPI = {
  uploadFile: (formData) => api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserUploads: () => api.get('/uploads'),
  deleteUpload: (id) => api.delete(`/uploads/${id}`)
};

// Summary API
export const summaryAPI = {
  getSummary: () => api.get('/summary')
};
