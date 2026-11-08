import { create } from 'axios';

import { defaultServerUrl } from './server';

export const api = create({
  baseURL: `${defaultServerUrl.replace(/\/+$/, '')}/api`,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
