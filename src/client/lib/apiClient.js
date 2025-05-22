// src/client/lib/apiClient.js
// Generic HTTP client for making API requests

/**
 * Makes a request to the API and handles common error scenarios
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string} authToken - Optional auth token for authenticated requests
 * @param {boolean} payloadIsJson - Whether to parse the response as JSON
 * @returns {Promise<Object>} - API response data
 */
export async function apiRequest(url, options = {}, authToken = null, payloadIsJson = true) {
  try {

    // Set up default headers
    const headers = {
      ...options.headers,
    };

    if( payloadIsJson ) {
      headers['Content-Type'] = 'application/json'
    }

    // Add authentication token if provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Parse the response based on the parseAsJson flag
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      const error         = new Error(data.message || `Request failed with status ${response.status}`);
            error.status  = response.status;
            error.code    = data.code;
            error.details = data.details;
      throw error;
    }
    
    // Return the response data directly (no unwrapping)
    return data;
  } catch (error) {
    // Log the error with the endpoint for easier debugging
    console.error(`API error (${options.method || 'GET'} ${url}):`, error);
    
    // Re-throw the error for handling by the caller
    throw error;
  }
}

/**
 * Makes a GET request to the API
 * @param {string} url - API endpoint URL
 * @param {string} authToken - Optional auth token for authenticated requests
 * @returns {Promise<Object>} - API response data
 */
export function get(url, authToken = null) {
  return apiRequest(url, { method: 'GET' }, authToken);
}

/**
 * Makes a POST request to the API
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request body data
 * @param {string} authToken - Optional auth token for authenticated requests
 * @returns {Promise<Object>} - API response data
 */
export function post(url, data = {}, authToken = null) {
  return apiRequest(
    url, 
    { 
      method: 'POST',
      body: JSON.stringify(data)
    }, 
    authToken
  );
}

/**
 * Makes a PUT request to the API
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request body data
 * @param {string} authToken - Optional auth token for authenticated requests
 * @returns {Promise<Object>} - API response data
 */
export function put(url, data = {}, authToken = null) {
  return apiRequest(
    url, 
    { 
      method: 'PUT',
      body: JSON.stringify(data)
    }, 
    authToken
  );
}

/**
 * Makes a DELETE request to the API
 * @param {string} url - API endpoint URL
 * @param {string} authToken - Optional auth token for authenticated requests
 * @returns {Promise<Object>} - API response data
 */
export function del(url, authToken = null) {
  return apiRequest(url, { method: 'DELETE' }, authToken);
}

/**
 * Makes a POST request to upload a file to the API
 * @param {string} url - API endpoint URL
 * @param {File} file - The file object to upload
 * @param {Object} additionalData - Additional form data to include in the request
 * @param {string} authToken - Optional auth token for authenticated requests
 * @returns {Promise<Object>} - API response data
 */
export function postFile(url, file, additionalData = {}, authToken = null) {
  // Create FormData object
  const formData = new FormData();
  
  // Append the file
  formData.append('file', file);
  
  // Append any additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Make the request with FormData as body
  // Note: Don't set Content-Type header as the browser will set it with the boundary
  return apiRequest(
    url, 
    { 
      method: 'POST',
      headers: {}, // Empty to avoid Content-Type: application/json
      body: formData
    }, 
    authToken,
    false // Don't parse as JSON since we're uploading a file
  );
}

export default {
  get,
  post,
  put,
  delete: del,
  postFile
};
