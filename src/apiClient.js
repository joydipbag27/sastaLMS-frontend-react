// Custom API client for veoLMS Backend testing

let apiBaseUrl = localStorage.getItem("veo_api_base_url") || "http://localhost:3000";
let logCallback = null;

export const setApiBaseUrl = (url) => {
  apiBaseUrl = url;
  localStorage.setItem("veo_api_base_url", url);
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
      credentials: "include", // Crucial for signed session cookies (sid)
    });
    
    status = response.status;
    success = response.ok;
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = { text: await response.text() };
    }
    
    const duration = Date.now() - startTime;
    logRequest(method, path, options.body, status, responseData, duration, success);
    
    return { success, status, data: responseData };
  } catch (error) {
    const duration = Date.now() - startTime;
    responseData = { error: error.message };
    logRequest(method, path, options.body, 500, responseData, duration, false);
    return { success: false, status: 500, data: responseData };
  }
};
