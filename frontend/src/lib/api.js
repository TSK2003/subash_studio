/**
 * Centralized API client for Subash Studio frontend.
 * Communicates with backend REST API using VITE_API_BASE_URL or dev proxy.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const TOKEN_KEY = "subash_admin_token";

let currentToken = null;
try {
  currentToken = localStorage.getItem(TOKEN_KEY);
} catch {
  // Fallback
}

export function setAuthToken(token) {
  currentToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Fallback
  }
}

export function getAuthToken() {
  return currentToken;
}

export function clearAuthToken() {
  currentToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Fallback
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const headers = {
    ...(options.headers || {}),
  };

  if (currentToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${currentToken}`;
  }

  // If body is JSON object, stringify and set Content-Type
  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: "include", // For secure httpOnly cookies
  });

  if (res.status === 401) {
    // If unauthorized, clear invalid token
    if (currentToken && !endpoint.includes("/api/auth/login")) {
      clearAuthToken();
    }
  }

  const contentType = res.headers.get("content-type");
  let data = null;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMessage =
      (data && typeof data === "object" && (data.error || data.message)) ||
      `Request failed with status ${res.status}`;
    const err = new Error(errorMessage);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export function uploadWithProgress(endpoint, formData, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

    xhr.open("POST", url, true);
    xhr.withCredentials = true;

    const token = currentToken || getAuthToken() || (typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Upload aborted by user."));
      });
    }

    if (xhr.upload && typeof onProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percent,
          });
        }
      };
    }

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch (e) {
        data = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const errorMsg =
          (data && typeof data === "object" && (data.error || data.message)) ||
          `Upload failed with status ${xhr.status}`;
        const err = new Error(errorMsg);
        err.status = xhr.status;
        err.data = data;
        reject(err);
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload. Please check your connection."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload cancelled."));
    };

    xhr.send(formData);
  });
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: "POST", body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: "PUT", body, ...options }),
  patch: (endpoint, body, options) => request(endpoint, { method: "PATCH", body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
  upload: (endpoint, formData, options) =>
    request(endpoint, {
      method: "POST",
      body: formData,
      ...options,
    }),
  uploadWithProgress,
};

export default api;

