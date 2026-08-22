import api from '../lib/apiClient';

export async function fetchGraph(orgId?: string, criticality: string = 'all') {
  const params: Record<string, string> = { criticality };
  if (orgId) params.org_id = orgId;
  const res = await api.get('/graph', { params });
  return res.data;
}
