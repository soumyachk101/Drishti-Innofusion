import api from '../lib/apiClient';

export async function fetchPaths(orgId: string) {
 const res = await api.get('/paths', { params: { org_id: orgId } });
 return res.data;
}

export async function fetchPathDetail(pathId: string) {
 const res = await api.get(`/paths/${pathId}`);
 return res.data;
}
