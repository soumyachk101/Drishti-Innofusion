import api from '../lib/apiClient';

export async function fetchRemediationActions(orgId: string) {
 const res = await api.get('/remediation/actions', { params: { org_id: orgId } });
 return res.data;
}

export async function generateRemediationForFinding(findingId: string) {
 const res = await api.post(`/remediation/generate/${findingId}`);
 return res.data;
}

export async function fetchTemplates() {
 const res = await api.get('/remediation/templates');
 return res.data;
}
