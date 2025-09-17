export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  nodeEnv: import.meta.env.MODE || 'development',
};
