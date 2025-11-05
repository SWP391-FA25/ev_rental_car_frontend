export const endpoints = {
  api: {
    base: () => '/api',
  },
  auth: {
    register: () => '/api/auth/register',
    login: () => '/api/auth/login',
    logout: () => '/api/auth/logout',
    me: () => '/api/auth/me',
    changePassword: () => '/api/auth/change-password',
  },

  staff: {
    getAll: () => '/api/staffs',
    getById: id => `/api/staffs/${id}`,
    create: () => '/api/staffs',
    update: id => `/api/staffs/${id}`,
    softDelete: id => `/api/staffs/${id}/soft-delete`,
    delete: id => `/api/staffs/${id}`,
  },
  stations: {
    getAll: () => '/api/stations',
    getById: id => `/api/stations/${id}`,
    getNearby: () => '/api/stations/nearby',
    create: () => '/api/stations',
    update: id => `/api/stations/${id}`,
    delete: id => `/api/stations/${id}`,
    softDelete: id => `/api/stations/soft-delete/${id}`,
    getUnavailable: () => '/api/stations/unavailable',
    getVehiclesAtStation: stationId =>
      `/api/stations/station/getVehiclesAtStation/${stationId}`,
    getStaffAtStation: stationId =>
      `/api/stations/station/getStaffAtStation/${stationId}`,
    getVehiclesDuringPeriod: () => '/api/stations/vehicles-availability',
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
    getByUserId: userId => `/api/documents/user/${userId}`,
    delete: id => `/api/documents/${id}`,
    verify: id => `/api/documents/${id}/verify`,
  },
  renters: {
    getAll: () => '/api/renters',
    getById: id => `/api/renters/${id}`,
    update: id => `/api/renters/${id}`,
    delete: id => `/api/renters/${id}`,
    create: () => '/api/renters',
  },
  promotions: {
    getAll: () => '/api/promotions',
    getById: id => `/api/promotions/${id}`,
    getByCode: code => `/api/promotions/code/${code}`,
    getActive: () => '/api/promotions/active',
    create: () => '/api/promotions',
    update: id => `/api/promotions/${id}`,
    delete: id => `/api/promotions/${id}`,
  },
  email: {
    sendVerification: () => '/api/emails/send-verification',
    verify: token => `/api/emails/verify/${token}`,
    forgotPassword: () => '/api/emails/forgot-password',
    verifyReset: token => `/api/emails/verify-reset/${token}`,
  },
  assignments: {
    getAll: () => '/api/assignments',
    getById: id => `/api/assignments/${id}`,
    getByStaffId: staffId => `/api/assignments/staff/${staffId}`,
    create: () => '/api/assignments',
    update: id => `/api/assignments/${id}`,
    delete: id => `/api/assignments/${id}`,
    getUnassignedStaff: () => '/api/assignments/unassigned-staff',
  },
  bookings: {
    getAll: () => '/api/bookings',
    getAnalytics: () => '/api/bookings/analytics',
    getById: id => `/api/bookings/${id}`,
    getUserBookings: userId => `/api/bookings/user/${userId}`,
    create: () => '/api/bookings',
    update: id => `/api/bookings/${id}`,
    updateStatus: id => `/api/bookings/${id}/status`,
    cancel: id => `/api/bookings/${id}/cancel`,
    complete: id => `/api/bookings/${id}/complete`,
    checkIn: bookingId => `/api/bookings/${bookingId}/checkin`,
    checkDeposit: id => `/api/bookings/${id}/deposit-status`,
  },
  rentalHistory: {
    getByBookingId: bookingId => `/api/rental-history/booking/${bookingId}`,
  },
  inspections: {
    getAll: () => `/api/inspections`,
    getById: id => `/api/inspections/${id}`,
    getByBooking: bookingId => `/api/inspections/booking/${bookingId}`,
    getByBookingRenter: bookingId => `/api/inspections/booking/${bookingId}/renter`,
    getByVehicle: vehicleId => `/api/inspections/vehicle/${vehicleId}`,
    getByStaff: staffId => `/api/inspections/staff/${staffId}`,
    create: () => '/api/inspections',
    uploadImage: inspectionId =>
      `/api/inspections/${inspectionId}/upload-image`,
    deleteImage: (inspectionId, imageIndex) =>
      `/api/inspections/${inspectionId}/image/${imageIndex}`,
    update: id => `/api/inspections/${id}`,
  },
  payment: {
    createDeposit: () => '/api/payos/create',
    createRentalFee: () => '/api/payos/create-rental-fee',
    getStatus: paymentId => `/api/payos/status/${paymentId}`,
    createCashPayment: () => '/api/payments/cash-payment',
    uploadCashEvidence: () => '/api/payments/cash-payment/evidence',
  },
  contracts: {
    // 🧾 Tạo hợp đồng mới (Staff/Admin)
    create: () => '/api/contracts',

    // 📤 Upload file hợp đồng đã ký (Staff/Admin)
    uploadSignedFile: (contractId) => `/api/contracts/${contractId}/upload`,

    // 🔍 Lấy chi tiết hợp đồng theo ID
    getById: (contractId) => `/api/contracts/${contractId}`,

    // 📚 Lấy danh sách hợp đồng theo booking ID
    getByBooking: (bookingId) => `/api/contracts/booking/${bookingId}`,

    // 📋 Lấy toàn bộ hợp đồng (Staff/Admin)
    getAll: () => '/api/contracts',

    // 📊 Lấy thống kê hợp đồng (Staff/Admin)
    getStats: () => '/api/contracts/stats/overview',
  },
};
