import api from '../lib/apiClient';

export async function fetchUsers() {
 const res = await api.get('/admin/users');
 return res.data;
}

export async function fetchOrgInfo() {
 const res = await api.get('/admin/org');
 return res.data;
}
