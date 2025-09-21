// Extracts user-friendly error messages from API responses based on HTTP status codes
export const getErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }

  const { status, data } = error.response;
  switch (status) {
    case 400:
      if (data && typeof data === 'object') {
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
      return data?.message || 'Invalid request. Please check your input.';

    case 401:
      return 'Authentication required. Please log in again.';

    case 403:
      return data?.message || 'Access denied. You do not have permission to perform this action.';

    case 404:
      return data?.message || 'The requested resource was not found.';

    case 409:
      return data?.message || 'Conflict. The resource already exists or is in use.';

    case 422:
      return data?.message || 'Validation failed. Please check your input.';

    case 429:
      return 'Too many requests. Please wait a moment and try again.';

    case 500:
      return 'Server error. Please try again later.';

    case 503:
      return 'Service temporarily unavailable. Please try again later.';

    default:
      return data?.message || `An error occurred (${status}). Please try again.`;
  }
};




// Extracts field-specific validation errors from API responses
export const getFieldErrors = (error) => {
  if (!error.response?.data || typeof error.response.data !== 'object') {
    return {};
  }

  const fieldErrors = {};
  Object.entries(error.response.data).forEach(([field, messages]) => {
    if (Array.isArray(messages)) {
      fieldErrors[field] = messages[0];
    } else if (typeof messages === 'string') {
      fieldErrors[field] = messages;
    }
  });

  return fieldErrors;
};




// Checks if error is due to network connectivity issues
export const isNetworkError = (error) => {
  return !error.response && error.request;
};




// Checks if error is a server-side error (5xx status codes)
export const isServerError = (error) => {
  return error.response && error.response.status >= 500;
};




// Checks if error is a client-side error (4xx status codes)
export const isClientError = (error) => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
};




// Logs detailed error information for debugging purposes
export const logError = (error, context = '') => {
  const errorInfo = {
    context,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method
  };

  console.error('API Error:', errorInfo);



};




// Creates a customizable error handler with logging and notification options
export const createErrorHandler = (options = {}) => {
  const {
    showToast = false,
    logErrors = true,
    context = ''
  } = options;

  return (error) => {
    if (logErrors) {
      logError(error, context);
    }

    const message = getErrorMessage(error);

    if (showToast && window.showToast) {
      window.showToast(message, 'error');
    }

    return {
      message,
      fieldErrors: getFieldErrors(error),
      isNetwork: isNetworkError(error),
      isServer: isServerError(error),
      isClient: isClientError(error)
    };
  };
};