import axios from 'axios';

const FIELD_MAP: Record<string, string> = {
  assigned_to: 'assignedTo',
  customer_id: 'customer',
  lead_id: 'lead',
  task_id: 'task',
  user_id: 'user',
  due_date: 'dueDate',
  password_hash: 'passwordHash',
  is_verified: 'isVerified',
  verification_token: 'verificationToken',
  reset_password_token: 'resetPasswordToken',
  reset_password_expires: 'resetPasswordExpires',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

function toCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const newKey = FIELD_MAP[key] || key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[newKey] = toCamelCase(value);
  }
  return result;
}

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => toCamelCase(response.data) as any,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post('http://localhost:3001/api/auth/refresh', {}, { withCredentials: true });
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
