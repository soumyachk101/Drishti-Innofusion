import api from '../lib/apiClient';

export async function generateRemediation(findingId: string) {
 const res = await api.post(`/ai/remediate?finding_id=${findingId}`);
 return res.data;
}

export async function computeImpact(assetId: string) {
 const res = await api.post(`/ai/impact?asset_id=${assetId}`);
 return res.data;
}

export async function predictRisk(assetId: string) {
 const res = await api.post(`/ai/predict?asset_id=${assetId}`);
 return res.data;
}
