import axios from "axios";
import { getAccessContext } from '../auth/accessContext';

const backendUrl = (import.meta.env.VITE_BACK_URL || "/video").replace(/\/$/, "");

export const api = axios.create({
  baseURL: `${backendUrl}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const accessContext = getAccessContext();

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (accessContext) config.headers['X-Access-Group'] = accessContext;

  return config;
});
