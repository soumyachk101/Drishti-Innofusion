import api from '../lib/apiClient';

export async function triggerScan(assetId: string) {
 const res = await api.post(`/scan/trigger/${assetId}`);
 return res.data;
}

export async function fetchScanHistory() {
 const res = await api.get('/scan/history');
 return res.data;
}
