import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
 id: string;
 name: string;
 email: string;
 role: string;
 org_id: string;
}

interface AuthState {
 user: User | null;
 loading: boolean;
}

interface AuthContextType extends AuthState {
 login: (email: string, password: string) => Promise<void>;
 register: (data: RegisterData) => Promise<void>;
 logout: () => void;
}

interface RegisterData {
 name: string;
 email: string;
 password: string;
 org_name: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
 const [state, setState] = useState<AuthState>({ user: null, loading: true });

 useEffect(() => {
 const stored = localStorage.getItem('user');
 if (stored) {
 setState({ user: JSON.parse(stored), loading: false });
 } else {
 setState({ user: null, loading: false });
 }
 }, []);

 const login = async (email: string, password: string) => {
 const res = await fetch('/api/v1/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password }),
 });
 if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
 const data = await res.json();
 localStorage.setItem('access_token', data.access_token);
 localStorage.setItem('refresh_token', data.refresh_token);
 const userRes = await fetch('/api/v1/auth/me', {
 headers: { Authorization: `Bearer ${data.access_token}` },
 });
 const user = await userRes.json();
 localStorage.setItem('user', JSON.stringify(user));
 setState({ user, loading: false });
 };

 const register = async (data: RegisterData) => {
 const res = await fetch('/api/v1/auth/register', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(data),
 });
 if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed');
 const result = await res.json();
 localStorage.setItem('access_token', result.access_token);
 localStorage.setItem('refresh_token', result.refresh_token);
 localStorage.setItem('user', JSON.stringify(result.user));
 setState({ user: result.user, loading: false });
 };

 const logout = () => {
 localStorage.removeItem('access_token');
 localStorage.removeItem('refresh_token');
 localStorage.removeItem('user');
 setState({ user: null, loading: false });
 };

 return (
 <AuthContext.Provider value={{ ...state, login, register, logout }}>
 {children}
 </AuthContext.Provider>
 );
}

export function useAuth() {
 const ctx = useContext(AuthContext);
 if (!ctx) throw new Error('useAuth must be used within AuthProvider');
 return ctx;
}
