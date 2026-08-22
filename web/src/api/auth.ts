import api from '../lib/apiClient';

export async function login(email: string, password: string) {
 const res = await api.post('/auth/login', { email, password });
 return res.data;
}

export async function register(name: string, email: string, password: string, orgName: string) {
 const res = await api.post('/auth/register', { name, email, password, org_name: orgName });
 return res.data;
}

export async function getMe() {
 const res = await api.get('/auth/me');
 return res.data;
}
