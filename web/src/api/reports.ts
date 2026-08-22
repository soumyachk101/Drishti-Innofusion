import api from '../lib/apiClient';

export async function fetchNetworkSummary() {
 const res = await api.get('/reports/network-summary');
 return res.data;
}

export async function fetchReportCVEs() {
 const res = await api.get('/reports/cves');
 return res.data;
}
