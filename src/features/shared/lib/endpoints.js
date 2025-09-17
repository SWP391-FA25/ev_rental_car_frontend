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
};
