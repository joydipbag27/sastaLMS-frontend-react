// Custom API client for veoLMS Backend testing

let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
let logCallback = null;

export const setApiBaseUrl = (url) => {
  apiBaseUrl = url;
};

export const getApiBaseUrl = () => apiBaseUrl;

export const registerLogCallback = (cb) => {
  logCallback = cb;
};

const logRequest = (method, path, body, status, response, duration, success) => {
  if (logCallback) {
    logCallback({
      timestamp: new Date().toLocaleTimeString(),
      method,
      url: `${apiBaseUrl}${path}`,
      body,
      status,
      response,
      duration: `${duration}ms`,
      success,
    });
  }
};

export const makeRequest = async (path, options = {}) => {
  const method = options.method || "GET";
  const headers = {
    ...options.headers,
  };
  
  let bodyToSend = options.body;
  
  if (bodyToSend && typeof bodyToSend === "object" && !(bodyToSend instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    bodyToSend = JSON.stringify(bodyToSend);
  }

  const startTime = Date.now();
  let status = 0;
  let responseData = null;
  let success = false;

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      method,
      headers,
      body: bodyToSend,
      credentials: "include",
    });
    
    status = response.status;
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = { text: await response.text() };
    }

    // Normalize the new backend response envelope:
    // Backend now returns: { success: bool, message: string, data: {...} | null, error: string }
    // We unwrap `data` so components access res.data.courses etc. instead of res.data.data.courses
    // Error messages stay at res.data.error, success messages at res.data.message
    let normalizedData;
    if (responseData && typeof responseData === "object" && "success" in responseData) {
      success = responseData.success;
      // Flatten: merge the inner data payload with message/error at the top level
      normalizedData = {
        ...(responseData.data || {}),
        message: responseData.message,
        error: responseData.error,
        success: responseData.success,
      };
    } else {
      // Passthrough for non-standard responses (e.g. text, legacy routes)
      success = response.ok;
      normalizedData = responseData;
    }
    
    const duration = Date.now() - startTime;
    logRequest(method, path, options.body, status, normalizedData, duration, success);
    
    return { success, status, data: normalizedData };
  } catch (error) {
    const duration = Date.now() - startTime;
    responseData = { error: error.message };
    logRequest(method, path, options.body, 500, responseData, duration, false);
    return { success: false, status: 500, data: responseData };
  }
};
