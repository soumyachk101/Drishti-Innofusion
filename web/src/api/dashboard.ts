import api from '../lib/apiClient';

export async function fetchDashboard(orgId: string) {
 const res = await api.get('/dashboard', { params: { org_id: orgId } });
 return res.data;
}
