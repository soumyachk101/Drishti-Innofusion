import api from '../lib/apiClient';

export async function checkHealth() {
 const res = await api.get('/health');
 return res.data;
}
