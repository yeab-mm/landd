import { API_URL } from '../api/config';

/** Socket.IO server URL (same host as API, without /api path). */
export function getSocketUrl(): string {
  const base = API_URL.replace(/\/api\/?$/, '');
  return base || 'http://localhost:3001';
}
