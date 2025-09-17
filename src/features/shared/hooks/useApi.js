import { useCallback, useMemo, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.request({ method, url, ...options });
      return res;
    } catch (err) {
      setError(err);
      return err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config) => request('GET', url, { ...config }), [request]);
  const post = useCallback((url, data, config) => request('POST', url, { data, ...config }), [request]);
  const put = useCallback((url, data, config) => request('PUT', url, { data, ...config }), [request]);
  const patch = useCallback((url, data, config) => request('PATCH', url, { data, ...config }), [request]);
  const del = useCallback((url, config) => request('DELETE', url, { ...config }), [request]);

  return useMemo(() => ({ get, post, put, patch, del, loading, error }), [get, post, put, patch, del, loading, error]);
}
