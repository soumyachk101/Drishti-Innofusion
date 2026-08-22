import api from '../lib/apiClient';

export async function fetchAssets(orgId: string) {
 const res = await api.get('/assets', { params: { org_id: orgId } });
 return res.data;
}

export async function fetchAssetDetail(orgId: string, assetId: string) {
 const res = await api.get(`/assets/${assetId}`, { params: { org_id: orgId } });
 return res.data;
}
