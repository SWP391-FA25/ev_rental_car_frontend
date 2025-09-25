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
    softDelete: id => `/api/stations/soft-delete/${id}`,
  },
  vehicles: {
    getAll: () => '/api/vehicles',
    getById: id => `/api/vehicles/${id}`,
    create: () => '/api/vehicles',
    update: id => `/api/vehicles/${id}`,
    softDelete: id => `/api/vehicles/soft-delete/${id}`,
    delete: id => `/api/vehicles/${id}`,
    uploadImage: vehicleId => `/api/vehicles/${vehicleId}/images`,
    getImages: vehicleId => `/api/vehicles/${vehicleId}/images`,
    deleteImage: (vehicleId, imageId) =>
      `/api/vehicles/${vehicleId}/images/${imageId}`,
  },
};
