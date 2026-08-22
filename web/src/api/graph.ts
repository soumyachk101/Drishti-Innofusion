import api from '../lib/apiClient';

export async function fetchGraph(orgId: string, criticality: string) {
 const res = await api.get('/graph/nx', { params: { org_id: orgId, criticality } });
 const data = res.data;
 const nodes = (data.nodes || []).map((n: any) => ({
 id: n.id,
 label: n.label || n.hostname || n.id,
 type: n.asset_type || n.type || 'unknown',
 criticality: n.criticality || 'medium',
 risk: n.risk_score || 0,
 }));
 const edges = (data.edges || []).map((e: any, i: number) => ({
 id: `e-${i}`,
 source: e.source,
 target: e.target,
 label: e.relation || '',
 }));
 return { nodes, edges };
}
