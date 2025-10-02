import { useCallback, useMemo } from 'react';
import { apiClient } from '../lib/apiClient';
import { useErrorHandler } from './useErrorHandler';

export function useApi(options = {}) {
  const {
    showToast = true,
    redirectOnAuth = true,
    logErrors = true,
    ...errorOptions
  } = options;

  const { isLoading, withErrorHandling, handleError, clearErrors } =
    useErrorHandler({
      showToast,
      redirectOnAuth,
      logErrors,
      ...errorOptions,
    });

  const request = useCallback(
    async (method, url, requestOptions = {}) => {
      const { skipErrorHandling = false, ...config } = requestOptions;

      if (skipErrorHandling) {
        // Direct API call without error handling
        return await apiClient.request({ method, url, ...config });
      }

      // Use error handling wrapper
      return await withErrorHandling(async () => {
        return await apiClient.request({ method, url, ...config });
      });
    },
    [withErrorHandling]
  );

  const get = useCallback(
    (url, config = {}) => request('GET', url, config),
    [request]
  );

  const post = useCallback(
    (url, data, config = {}) => request('POST', url, { data, ...config }),
    [request]
  );

  const put = useCallback(
    (url, data, config = {}) => request('PUT', url, { data, ...config }),
    [request]
  );

  const patch = useCallback(
    (url, data, config = {}) => request('PATCH', url, { data, ...config }),
    [request]
  );

  const del = useCallback(
    (url, config = {}) => request('DELETE', url, config),
    [request]
  );

  return useMemo(
    () => ({
      get,
      post,
      put,
      patch,
      del,
      loading: isLoading,
      handleError,
      clearErrors,
    }),
    [get, post, put, patch, del, isLoading, handleError, clearErrors]
  );
}
