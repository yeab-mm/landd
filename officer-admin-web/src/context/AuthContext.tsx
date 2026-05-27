import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { API_BASE } from '../config'

export type PortalUser = {
  id: string
  email: string | null
  fullName: string
  phone?: string | null
  role: string
}

type AuthContextValue = {
  token: string | null
  user: PortalUser | null
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
  isOfficer: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_TOKEN = 'land_portal_token'
const STORAGE_USER = 'land_portal_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_TOKEN))
  const [user, setUser] = useState<PortalUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_USER)
    if (!raw) return null
    try {
      return JSON.parse(raw) as PortalUser
    } catch {
      return null
    }
  })

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }
    const t = data.token as string
    const u = data.user as PortalUser
    if (!t || !u) throw new Error('Invalid server response')
    const normalized = { ...u, role: (u.role || '').toLowerCase() }
    localStorage.setItem(STORAGE_TOKEN, t)
    localStorage.setItem(STORAGE_USER, JSON.stringify(normalized))
    setToken(t)
    setUser(normalized)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    setToken(null)
    setUser(null)
  }, [])

  const role = (user?.role || '').toLowerCase()
  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      login,
      logout,
      isAdmin: role === 'admin',
      isOfficer: role === 'officer',
    }),
    [token, user, login, logout, role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function authHeaders(token: string | null): HeadersInit {
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
