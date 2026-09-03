const API_BASE = '/api';

function getAuthToken() {
  return localStorage.getItem('bhoomi_token');
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({ success: false, error: 'Failed to parse JSON response' }));

  if (!res.ok) {
    if (res.status === 403) {
      console.warn('403 Forbidden:', data.error);
    }
    throw new Error(data.error || `HTTP Error ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  publicLogin: () => request('/auth/public-login', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Metadata
  getStates: () => request('/metadata/states'),
  getDistricts: (stateId) => request(`/metadata/districts${stateId ? `?stateId=${stateId}` : ''}`),
  getRoles: () => request('/metadata/roles'),

  // Projects
  getProjects: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/projects${q ? `?${q}` : ''}`);
  },
  getProjectById: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Workflow
  getWorkflow: (projectId) => request(`/workflows/project/${projectId}`),
  performWorkflowAction: (data) => request('/workflows/action', { method: 'POST', body: JSON.stringify(data) }),

  // Parcels & GIS
  getParcels: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/parcels${q ? `?${q}` : ''}`);
  },
  getParcelById: (id) => request(`/parcels/${id}`),
  updateParcelStatus: (id, data) => request(`/parcels/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  verifyParcelGps: (id, data) => request(`/parcels/${id}/verify`, { method: 'POST', body: JSON.stringify(data) }),
  getGeoJson: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/gis/geojson${q ? `?${q}` : ''}`);
  },

  // Compensation
  getCompensation: (projectId) => request(`/compensation/project/${projectId}`),
  disbursePayment: (data) => request('/compensation/disburse', { method: 'POST', body: JSON.stringify(data) }),

  // R&R & Families
  getRr: (projectId) => request(`/rr/project/${projectId}`),
  updateRrProgress: (projectId, data) => request(`/rr/project/${projectId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getFamilies: (projectId) => request(`/families/project/${projectId}`),

  // Possession
  getPossession: (projectId) => request(`/possession/project/${projectId}`),
  recordPossession: (data) => request('/possession/record', { method: 'POST', body: JSON.stringify(data) }),

  // Documents
  getDocuments: (projectId, category) => request(`/documents/project/${projectId}${category ? `?category=${category}` : ''}`),
  uploadDocument: (formData) => request('/documents/upload', { method: 'POST', body: formData }),
  verifyDocument: (id, status) => request(`/documents/${id}/verify`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllAsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Analytics & Risk
  getNationalKpis: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/analytics/national${q ? `?${q}` : ''}`);
  },
  getProjectRisk: (projectId) => request(`/analytics/project/${projectId}/risk`),

  // MIS Reports
  getMisReports: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/mis${q ? `?${q}` : ''}`);
  },

  // Audit Logs (strictly admin)
  getAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/audit${q ? `?${q}` : ''}`);
  },

  // Integrations
  getLandRecordsMock: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/integrations/land-records${q ? `?${q}` : ''}`);
  },
  getCadastralMock: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/integrations/cadastral${q ? `?${q}` : ''}`);
  },
  getProjectDataMock: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/integrations/project-data${q ? `?${q}` : ''}`);
  },

  // Users
  getUsers: () => request('/users')
};
