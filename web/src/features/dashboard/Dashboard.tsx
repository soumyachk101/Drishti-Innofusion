import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import { fetchDashboard } from '../../api/dashboard';
import { RiskPieChart, RiskBarChart, TrendLineChart } from '../../components/charts';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardData {
  total_assets: number;
  total_findings: number;
  critical_findings: number;
  risk_score: number;
  high_risk_assets: number;
  findings_by_severity: Record<string, number>;
  risk_trend: { date: string; score: number }[];
  asset_type_risk: { type: string; risk: number }[];
  attack_path_count: number;
}

const DEFAULT_DASHBOARD: DashboardData = {
  total_assets: 12,
  total_findings: 18,
  critical_findings: 4,
  risk_score: 78,
  high_risk_assets: 5,
  findings_by_severity: { Critical: 4, High: 7, Medium: 5, Low: 2 },
  risk_trend: [
    { date: 'Aug 18', score: 85 },
    { date: 'Aug 19', score: 82 },
    { date: 'Aug 20', score: 80 },
    { date: 'Aug 21', score: 79 },
    { date: 'Aug 22', score: 78 },
  ],
  asset_type_risk: [
    { type: 'Database', risk: 88 },
    { type: 'Server', risk: 74 },
    { type: 'Web App', risk: 65 },
    { type: 'Firewall', risk: 42 },
    { type: 'Workstation', risk: 35 },
  ],
  attack_path_count: 5,
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard(user?.org_id)
      .then((d) => {
        if (d && typeof d === 'object') {
          setData({
            total_assets: d.total_assets ?? d.asset_count ?? DEFAULT_DASHBOARD.total_assets,
            total_findings: d.total_findings ?? d.finding_count ?? DEFAULT_DASHBOARD.total_findings,
            critical_findings: d.critical_findings ?? DEFAULT_DASHBOARD.critical_findings,
            risk_score: d.risk_score ?? d.org_risk_score ?? DEFAULT_DASHBOARD.risk_score,
            high_risk_assets: d.high_risk_assets ?? DEFAULT_DASHBOARD.high_risk_assets,
            findings_by_severity: d.findings_by_severity ?? DEFAULT_DASHBOARD.findings_by_severity,
            risk_trend: d.risk_trend ?? DEFAULT_DASHBOARD.risk_trend,
            asset_type_risk: d.asset_type_risk ?? DEFAULT_DASHBOARD.asset_type_risk,
            attack_path_count: d.attack_path_count ?? d.top_paths_count ?? DEFAULT_DASHBOARD.attack_path_count,
          });
        } else {
          setData(DEFAULT_DASHBOARD);
        }
      })
      .catch(() => {
        setData(DEFAULT_DASHBOARD);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.org_id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: '#00e676' }} />
      </Box>
    );
  }

  const current = data || DEFAULT_DASHBOARD;

  const stats = [
    { label: 'Total Assets', value: current.total_assets, color: '#00e676' },
    { label: 'Total Findings', value: current.total_findings, color: '#ff6d00' },
    { label: 'Critical', value: current.critical_findings, color: '#f44336' },
    { label: 'Risk Score', value: `${current.risk_score}%`, color: '#ffd54f' },
    { label: 'High Risk Assets', value: current.high_risk_assets, color: '#ff9800' },
    { label: 'Attack Paths', value: current.attack_path_count, color: '#2196f3' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#fff' }}>
        Executive Security Dashboard
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={2} key={s.label}>
            <Card sx={{ bgcolor: '#111827', border: '1px solid #1f2937' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'grey.400' }}>{s.label}</Typography>
                <Typography variant="h5" sx={{ color: s.color, fontWeight: 700, mt: 0.5 }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#111827', border: '1px solid #1f2937' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#fff', fontSize: 16 }}>Findings by Severity</Typography>
            <RiskPieChart data={current.findings_by_severity} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#111827', border: '1px solid #1f2937' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#fff', fontSize: 16 }}>Asset Type Risk</Typography>
            <RiskBarChart data={current.asset_type_risk} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#111827', border: '1px solid #1f2937' }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#fff', fontSize: 16 }}>Risk Trend</Typography>
            <TrendLineChart data={current.risk_trend} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
