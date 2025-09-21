






import { useCallback } from 'react';




// Checks if an API response follows the standardized format with success and timestamp fields
export const isStandardizedResponse = (response) => {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    'timestamp' in response
  );
};




// Extracts the actual data from API responses, handling both standardized and legacy formats
export const extractResponseData = (response) => {
  if (!response) return null;


  const responseData = response.data || response;


  if (isStandardizedResponse(responseData)) {
    return responseData.data;
  }


  return responseData;
};




// Safely extracts array data from API responses with fallback for non-array responses
export const extractArrayData = (response, fallback = []) => {
  const data = extractResponseData(response);
  return Array.isArray(data) ? data : fallback;
};




// Extracts error information from failed API responses in a consistent format
export const extractResponseError = (error) => {
  if (!error) return null;


  const errorResponse = error.response?.data || error.data || error;

  if (isStandardizedResponse(errorResponse)) {
    return {
      message: errorResponse.message || 'An error occurred',
      errors: errorResponse.errors || {},
      success: errorResponse.success || false,
      timestamp: errorResponse.timestamp
    };
  }


  return {
    message: error.message || 'An unexpected error occurred',
    errors: {},
    success: false,
    timestamp: new Date().toISOString()
  };
};




// Extracts pagination metadata from standardized API responses
export const extractPaginationInfo = (response) => {
  if (!response) return null;

  const responseData = response.data || response;

  if (isStandardizedResponse(responseData) && responseData.pagination) {
    return responseData.pagination;
  }

  return null;
};




// Gets success message from API response or returns default message
export const getSuccessMessage = (response, defaultMessage = 'Operation completed successfully') => {
  const responseData = response.data || response;

  if (isStandardizedResponse(responseData)) {
    return responseData.message || defaultMessage;
  }

  return defaultMessage;
};




// Comprehensive API response handler with success/error callbacks and toast notifications
export const handleApiResponse = (response, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessMessage = false,
    showErrorMessage = true,
    extractData = true
  } = options;

  try {
    const data = extractData ? extractResponseData(response) : response;
    const message = getSuccessMessage(response);

    if (showSuccessMessage && window.showToast) {
      window.showToast(message, 'success');
    }

    if (onSuccess) {
      onSuccess(data, message);
    }

    return { success: true, data, message };
  } catch (error) {
    const errorInfo = extractResponseError(error);

    if (showErrorMessage && window.showToast) {
      window.showToast(errorInfo.message, 'error');
    }

    if (onError) {
      onError(errorInfo);
    }

    return { success: false, error: errorInfo };
  }
};




// Converts legacy API responses to standardized format for consistent handling
export const normalizeApiResponse = (response) => {
  const responseData = response.data || response;


  if (isStandardizedResponse(responseData)) {
    return responseData;
  }


  return {
    success: true,
    data: responseData,
    message: 'Request completed successfully',
    timestamp: new Date().toISOString()
  };
};




// Creates a wrapper around API client that standardizes responses and error handling
export const createApiWrapper = (apiClient) => {
  const wrappedApi = {};


  ['get', 'post', 'put', 'patch', 'delete'].forEach(method => {
    wrappedApi[method] = async (...args) => {
      try {
        const response = await apiClient[method](...args);
        return {
          success: true,
          data: extractResponseData(response),
          message: getSuccessMessage(response),
          pagination: extractPaginationInfo(response),
          raw: response
        };
      } catch (error) {
        const errorInfo = extractResponseError(error);
        throw {
          success: false,
          error: errorInfo,
          raw: error
        };
      }
    };
  });

  return wrappedApi;
};




// React hook that provides response handling utilities for API calls
export const useApiResponseHandler = () => {
  const handleResponse = useCallback((response, options = {}) => {
    return handleApiResponse(response, options);
  }, []);

  const extractData = useCallback((response) => {
    return extractResponseData(response);
  }, []);

  const extractError = useCallback((error) => {
    return extractResponseError(error);
  }, []);

  const getSuccessMsg = useCallback((response, defaultMessage) => {
    return getSuccessMessage(response, defaultMessage);
  }, []);

  return {
    handleResponse,
    extractData,
    extractError,
    getSuccessMessage: getSuccessMsg,
    isStandardized: isStandardizedResponse
  };
};