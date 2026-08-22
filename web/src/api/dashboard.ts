import api from '../lib/apiClient';

export async function fetchDashboard() {
 const res = await api.get('/dashboard');
 const d = res.data;
 return {
 total_assets: d.critical_assets || 0,
 total_findings: d.open_findings || 0,
 critical_findings: d.severity_counts?.critical || 0,
 risk_score: d.top_path?.risk_score ? Math.round(d.top_path.risk_score * 100) : 0,
 high_risk_assets: d.critical_assets || 0,
 findings_by_severity: d.severity_counts || {},
 risk_trend: [],
 asset_type_risk: d.zone_summary?.map((z: any) => ({ type: z.zone, risk: z.critical_assets })) || [],
 attack_path_count: d.paths?.length || 0,
 };
}
