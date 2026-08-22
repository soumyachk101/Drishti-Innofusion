import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/apiClient';

interface User {
 id: string;
 email: string;
 name: string;
 role: string;
 org_id: string;
}

interface AuthContextValue {
 user: User | null;
 loading: boolean;
 login: (email: string, password: string) => Promise<void>;
 register: (email: string, password: string, name: string) => Promise<void>;
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

export default function AuthProvider({ children }: { children: React.ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const stored = localStorage.getItem('drishti_user');
 if (stored) setUser(JSON.parse(stored));
 setLoading(false);
 }, []);

 const login = async (email: string, password: string) => {
 const res = await api.post('/auth/login', { email, password });
 const token = res.data.access_token;
 localStorage.setItem('access_token', token);
 // Fetch user profile
 const me = await api.get('/auth/me');
 setUser(me.data);
 localStorage.setItem('drishti_user', JSON.stringify(me.data));
};

 const register = async (email: string, password: string, name: string) => {
 const res = await api.post('/auth/register', { email, password, name, org_name: 'Default Org' });
 const token = res.data.access_token;
 localStorage.setItem('access_token', token);
 const me = await api.get('/auth/me');
 setUser(me.data);
 localStorage.setItem('drishti_user', JSON.stringify(me.data));
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
