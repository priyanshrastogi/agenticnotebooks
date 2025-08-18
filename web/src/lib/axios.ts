import axios from 'axios';

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  withCredentials: true, // Enable sending cookies for cross-site requests
  headers: {
    'Content-Type': 'application/json',
  },
});
