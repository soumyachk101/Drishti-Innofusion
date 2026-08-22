import api from '../lib/apiClient';

export async function fetchDashboard(orgId?: string) {
  const params = orgId ? { org_id: orgId } : {};
  const res = await api.get('/dashboard', { params });
  return res.data;
}
