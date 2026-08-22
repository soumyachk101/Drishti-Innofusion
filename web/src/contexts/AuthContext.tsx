import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/apiClient';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  org_id: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  org_name?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (dataOrEmail: RegisterParams | string, password?: string, name?: string, orgName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('drishti_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('drishti_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.access_token;
    localStorage.setItem('access_token', token);
    if (res.data.refresh_token) {
      localStorage.setItem('refresh_token', res.data.refresh_token);
    }
    try {
      const me = await api.get('/auth/me');
      setUser(me.data);
      localStorage.setItem('drishti_user', JSON.stringify(me.data));
    } catch {
      const dummyUser: User = { id: 'usr-1', email, name: email.split('@')[0], role: 'admin', org_id: 'org-1' };
      setUser(dummyUser);
      localStorage.setItem('drishti_user', JSON.stringify(dummyUser));
    }
  };

  const register = async (dataOrEmail: RegisterParams | string, password?: string, name?: string, orgName?: string) => {
    let payload: RegisterParams;
    if (typeof dataOrEmail === 'object') {
      payload = dataOrEmail;
    } else {
      payload = {
        email: dataOrEmail,
        password: password || '',
        name: name || dataOrEmail.split('@')[0],
        org_name: orgName || 'Default Org',
      };
    }
    const res = await api.post('/auth/register', payload);
    const token = res.data.access_token;
    localStorage.setItem('access_token', token);
    if (res.data.refresh_token) {
      localStorage.setItem('refresh_token', res.data.refresh_token);
    }
    try {
      const me = await api.get('/auth/me');
      setUser(me.data);
      localStorage.setItem('drishti_user', JSON.stringify(me.data));
    } catch {
      const dummyUser: User = { id: 'usr-1', email: payload.email, name: payload.name, role: 'admin', org_id: 'org-1' };
      setUser(dummyUser);
      localStorage.setItem('drishti_user', JSON.stringify(dummyUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('drishti_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
