export const endpoints = {
  api: {
    base: () => '/api',
  },
  auth: {
    register: () => '/api/auth/register',
    login: () => '/api/auth/login',
    logout: () => '/api/auth/logout',
    me: () => '/api/auth/me',
  },
  staff: {
    getAll: () => '/api/staff',
    getById: id => `/api/staff/${id}`,
    create: () => '/api/staff',
    update: id => `/api/staff/${id}`,
    softDelete: id => `/api/staff/${id}/soft-delete`,
    delete: id => `/api/staff/${id}`,
  },
  stations: {
    getAll: () => '/api/stations',
    getById: id => `/api/stations/${id}`,
    create: () => '/api/stations',
    update: id => `/api/stations/${id}`,
    delete: id => `/api/stations/${id}`,
  },
};
