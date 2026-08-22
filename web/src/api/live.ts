import api from '../lib/apiClient';

export async function triggerLiveDemo() {
 const res = await api.post('/live/demo');
 return res.data;
}

export async function fetchDevices() {
 const res = await api.get('/live/devices');
 return res.data;
}

export async function fetchThreats() {
 const res = await api.get('/live/threats');
 return res.data;
}

export async function fetchCoverage() {
 const res = await api.get('/live/coverage');
 return res.data;
}
