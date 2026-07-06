const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
function getHeaders(contentType: string = 'application/json') {
  const token = typeof window !== 'undefined' ? localStorage.getItem('clothing_store_token') : null;
  const headers: HeadersInit = {};
  
  if (contentType !== 'multipart') {
    headers['Content-Type'] = contentType;
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Global fetch wrapper
async function request<T = any>(method: string, endpoint: string, body?: any, isMultipart: boolean = false): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: getHeaders(isMultipart ? 'multipart' : 'application/json'),
  };

  if (body) {
    if (isMultipart) {
      options.body = body; // Body is FormData
    } else {
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>('GET', endpoint),
  post: <T = any>(endpoint: string, body: any, isMultipart: boolean = false) => request<T>('POST', endpoint, body, isMultipart),
  put: <T = any>(endpoint: string, body: any, isMultipart: boolean = false) => request<T>('PUT', endpoint, body, isMultipart),
  delete: <T = any>(endpoint: string) => request<T>('DELETE', endpoint),
};
