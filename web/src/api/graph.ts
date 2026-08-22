import api from '../lib/apiClient';

export async function fetchGraph(orgId: string, criticality: string = 'all') {
 const res = await api.get('/graph', { params: { org_id: orgId, criticality } });
 return res.data;
}
