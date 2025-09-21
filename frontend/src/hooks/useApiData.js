import { useState, useCallback, useEffect } from 'react';
import api from '../api';

export const useApiData = (endpoint, options = {}) => {
  const {
    dependencies = [],
    autoFetch = true,
    onSuccess,
    onError,
    initialData = null
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetches data from the API endpoint and handles loading/error states
  const fetchData = useCallback(async () => {
    if (!endpoint) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(endpoint);
      setData(response.data);
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, ...dependencies]);

  // Manually triggers a data refetch from the API
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Updates the data state without making an API call
  const updateData = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    updateData,
    setData,
    setLoading,
    setError
  };
};

export const useMultipleApiData = (endpoints, options = {}) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetches data from multiple endpoints concurrently and aggregates results
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const promises = Object.entries(endpoints).map(async ([key, endpoint]) => {
      try {
        const response = await api.get(endpoint);
        return { key, data: response.data, error: null };
      } catch (error) {
        return { key, data: null, error };
      }
    });

    try {
      const results = await Promise.all(promises);
      const newData = {};
      const newErrors = {};

      results.forEach(({ key, data, error }) => {
        if (error) {
          newErrors[key] = error;
        } else {
          newData[key] = data;
        }
      });

      setData(newData);
      setErrors(newErrors);
    } catch (err) {

      console.error('Unexpected error in fetchAllData:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoints]);

  useEffect(() => {
    if (Object.keys(endpoints).length > 0) {
      fetchAllData();
    }
  }, [fetchAllData]);

  return {
    data,
    loading,
    errors,
    refetch: fetchAllData,
    updateData: setData
  };
};

export const useApiMutation = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Executes API mutations with optimistic updates and error handling
  const mutate = useCallback(async (request, optimisticUpdate = null) => {
    setLoading(true);
    setError(null);

    try {
      if (optimisticUpdate) {
        optimisticUpdate.apply();
      }

      const result = await request();

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      if (optimisticUpdate) {
        optimisticUpdate.revert();
      }

      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    mutate,
    loading,
    error,
    setError
  };
};