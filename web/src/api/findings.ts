import api from '../lib/apiClient';

export async function fetchFindings(orgId: string) {
 const res = await api.get('/findings', { params: { org_id: orgId } });
 return res.data;
}

export async function updateFinding(orgId: string, assetId: string, findingId: string, data: Record<string, unknown>) {
 const res = await api.patch(`/assets/${assetId}/findings/${findingId}`, data, { params: { org_id: orgId } });
 return res.data;
}
