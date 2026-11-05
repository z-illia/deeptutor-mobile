import { create } from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error('EXPO_PUBLIC_API_URL is not configured');
}

export const api = create({
  baseURL: `${baseURL.replace(/\/+$/, '')}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
