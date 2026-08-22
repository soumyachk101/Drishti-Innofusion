import api from '../lib/apiClient';

export async function fetchCVEs() {
 const res = await api.get('/intel/cves');
 return res.data;
}

export async function fetchSeverityStats() {
 const res = await api.get('/intel/severity');
 return res.data;
}

export async function fetchMLInsights() {
 const res = await api.get('/intel/ml');
 return res.data;
}

export async function fetchNetworkSummary() {
 const res = await api.get('/intel/summary');
 return res.data;
}
