import api from '../lib/apiClient';

export async function fetchPaths(orgId?: string) {
  const params = orgId ? { org_id: orgId } : {};
  const res = await api.get('/paths', { params });
  return res.data;
}

export async function fetchPathDetail(pathId: string) {
  const res = await api.get(`/paths/${pathId}`);
  return res.data;
}
