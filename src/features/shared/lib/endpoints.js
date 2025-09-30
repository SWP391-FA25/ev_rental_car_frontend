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
    getAll: () => '/api/staffs',
    getById: id => `/api/staffs/${id}`,
    create: () => '/api/staffs',
    update: id => `/api/staffs/${id}`,
    softDelete: id => `/api/staffs/soft-delete/${id}`,
    delete: id => `/api/staffs/${id}`,
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
  documents: {
    upload: () => '/api/documents/upload',
    myDocuments: () => '/api/documents/my-documents',
    getAll: () => '/api/documents/all',
    delete: id => `/api/documents/${id}`,
    verify: id => `/api/documents/${id}/verify`,
  },
  renters: {
    getAll: () => '/api/renters',
    getById: id => `/api/renters/${id}`,
    update: id => `/api/renters/${id}`,
    delete: id => `/api/renters/${id}`
  },
};
