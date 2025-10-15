import axios from 'axios';
import { User, Category, Task } from './types';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userAPI = {
  getAll: () => api.get<User[]>('/users'),
  create: (user: Omit<User, '_id' | 'created_at'>) => api.post<User>('/users', user),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (name: string) => api.post<Category>('/categories', { name }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Task API
export const taskAPI = {
  getAll: () => api.get<Task[]>('/tasks'),
  create: (task: Omit<Task, '_id' | 'created_at' | 'lastNotified' | 'status'>) =>
    api.post<Task>('/tasks', task),
  update: (id: string, task: Partial<Task>) =>
    api.put<Task>(`/tasks/${id}`, task),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  complete: (id: string) => api.patch<Task>(`/tasks/${id}/complete`),
};

export default api;