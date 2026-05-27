/** Base URL for Land Portal API (includes `/api`). */
export const API_BASE =
  (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL?.replace(
    /\/$/,
    '',
  ) || 'http://localhost:3001/api'
