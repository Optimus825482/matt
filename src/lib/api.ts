import type {
  AuthPayload,
  ChildDashboard,
  ChildSessionPayload,
  MeResponse,
  SessionSaveResponse,
  SuperAdminLoginPayload,
  SuperAdminOverview,
} from '../types/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? 'İstek başarısız oldu.')
  }

  return response.json() as Promise<T>
}

export const api = {
  signup(payload: AuthPayload) {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  login(payload: Pick<AuthPayload, 'username' | 'password'>) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  logout() {
    return request('/api/auth/logout', {
      method: 'POST',
    })
  },
  me() {
    return request<MeResponse>('/api/auth/me')
  },
  getChildDashboard() {
    return request<ChildDashboard>('/api/child/dashboard')
  },
  saveChildSession(payload: ChildSessionPayload) {
    return request<SessionSaveResponse>('/api/game/session', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  superAdminLogin(payload: SuperAdminLoginPayload) {
    return request('/api/superadmin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  superAdminLogout() {
    return request('/api/superadmin/logout', {
      method: 'POST',
    })
  },
  getSuperAdminOverview() {
    return request<SuperAdminOverview>('/api/superadmin/overview')
  },
}
