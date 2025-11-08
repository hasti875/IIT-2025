import api from './api';

export const authService = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export const projectService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/projects', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Team member management
  getProjectTeam: async (id) => {
    const response = await api.get(`/projects/${id}/team`);
    return response.data;
  },

  addTeamMember: async (id, userId) => {
    const response = await api.post(`/projects/${id}/team`, { userId });
    return response.data;
  },

  removeTeamMember: async (id, userId) => {
    const response = await api.delete(`/projects/${id}/team/${userId}`);
    return response.data;
  },

  // Project messages
  getMessages: async (projectId, params = {}) => {
    const response = await api.get(`/projects/${projectId}/messages`, { params });
    return response.data;
  },

  sendMessage: async (projectId, messageData) => {
    const response = await api.post(`/projects/${projectId}/messages`, messageData);
    return response.data;
  },

  deleteMessage: async (projectId, messageId) => {
    const response = await api.delete(`/projects/${projectId}/messages/${messageId}`);
    return response.data;
  }
};

export const taskService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

export const financeService = {
  // Sales Orders
  getSalesOrders: async (filters = {}) => {
    const response = await api.get('/finance/salesorders', { params: filters });
    return response.data;
  },

  createSalesOrder: async (data) => {
    const response = await api.post('/finance/salesorders', data);
    return response.data;
  },

  updateSalesOrder: async (id, data) => {
    const response = await api.put(`/finance/salesorders/${id}`, data);
    return response.data;
  },

  deleteSalesOrder: async (id) => {
    const response = await api.delete(`/finance/salesorders/${id}`);
    return response.data;
  },

  // Purchase Orders
  getPurchaseOrders: async (filters = {}) => {
    const response = await api.get('/finance/purchaseorders', { params: filters });
    return response.data;
  },

  createPurchaseOrder: async (data) => {
    const response = await api.post('/finance/purchaseorders', data);
    return response.data;
  },

  updatePurchaseOrder: async (id, data) => {
    const response = await api.put(`/finance/purchaseorders/${id}`, data);
    return response.data;
  },

  deletePurchaseOrder: async (id) => {
    const response = await api.delete(`/finance/purchaseorders/${id}`);
    return response.data;
  },

  // Expenses
  getExpenses: async (filters = {}) => {
    const response = await api.get('/finance/expenses', { params: filters });
    return response.data;
  },

  createExpense: async (data) => {
    const response = await api.post('/finance/expenses', data);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await api.put(`/finance/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/finance/expenses/${id}`);
    return response.data;
  },

  // Expense approval (Admin only)
  approveExpense: async (id, status) => {
    const response = await api.put(`/finance/expenses/${id}/approval`, { status });
    return response.data;
  },

  // Invoices
  getInvoices: async (filters = {}) => {
    const response = await api.get('/finance/invoices', { params: filters });
    return response.data;
  },

  createInvoice: async (data) => {
    const response = await api.post('/finance/invoices', data);
    return response.data;
  },

  updateInvoice: async (id, data) => {
    const response = await api.put(`/finance/invoices/${id}`, data);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await api.delete(`/finance/invoices/${id}`);
    return response.data;
  }
};

export const dashboardService = {
  getAnalytics: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export const timesheetService = {
  getTimesheets: async (filters = {}) => {
    const response = await api.get('/timesheets', { params: filters });
    return response.data;
  },

  createTimesheet: async (data) => {
    const response = await api.post('/timesheets', data);
    return response.data;
  },

  updateTimesheet: async (id, data) => {
    const response = await api.put(`/timesheets/${id}`, data);
    return response.data;
  },

  deleteTimesheet: async (id) => {
    const response = await api.delete(`/timesheets/${id}`);
    return response.data;
  }
};
