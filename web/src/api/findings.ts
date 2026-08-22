import api from '../lib/apiClient';

export async function fetchFindings(orgId?: string) {
  const params = orgId ? { org_id: orgId } : {};
  const res = await api.get('/findings', { params });
  return res.data;
}

export async function updateFinding(findingId: string, data: Record<string, unknown>, orgId?: string, assetId?: string) {
  const params = orgId ? { org_id: orgId } : {};
  const endpoint = assetId ? `/assets/${assetId}/findings/${findingId}` : `/findings/${findingId}`;
  const res = await api.patch(endpoint, data, { params });
  return res.data;
}
