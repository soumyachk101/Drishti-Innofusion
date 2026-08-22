import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import { fetchDashboard } from '../../api/dashboard';
import { RiskPieChart, RiskBarChart, TrendLineChart } from '../../components/charts';

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

export default function Dashboard() {
 const [data, setData] = useState<DashboardData | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchDashboard().then((d) => { setData(d); setLoading(false); });
 }, []);

 if (loading) return <CircularProgress sx={{ mt: 4 }} />;
 if (!data) return <Typography>No data available</Typography>;

 const stats = [
 { label: 'Total Assets', value: data.total_assets, color: '#00e676' },
 { label: 'Total Findings', value: data.total_findings, color: '#ff6d00' },
 { label: 'Critical', value: data.critical_findings, color: '#f44336' },
 { label: 'Risk Score', value: `${data.risk_score}%`, color: '#ffd54f' },
 { label: 'High Risk Assets', value: data.high_risk_assets, color: '#ff9800' },
 { label: 'Attack Paths', value: data.attack_path_count, color: '#2196f3' },
 ];

 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
 <Grid container spacing={2} sx={{ mb: 3 }}>
 {stats.map((s) => (
 <Grid item xs={12} sm={6} md={2} key={s.label}>
 <Card sx={{ bgcolor: '#111827' }}>
 <CardContent>
 <Typography variant="caption" sx={{ color: 'grey.400' }}>{s.label}</Typography>
 <Typography variant="h5" sx={{ color: s.color }}>{s.value}</Typography>
 </CardContent>
 </Card>
 </Grid>
 ))}
 </Grid>
 <Grid container spacing={3}>
 <Grid item xs={12} md={4}>
 <Paper sx={{ p: 2, bgcolor: '#111827' }}>
 <Typography variant="h6" sx={{ mb: 1 }}>Findings by Severity</Typography>
 <RiskPieChart data={data.findings_by_severity} />
 </Paper>
 </Grid>
 <Grid item xs={12} md={4}>
 <Paper sx={{ p: 2, bgcolor: '#111827' }}>
 <Typography variant="h6" sx={{ mb: 1 }}>Asset Type Risk</Typography>
 <RiskBarChart data={data.asset_type_risk} />
 </Paper>
 </Grid>
 <Grid item xs={12} md={4}>
 <Paper sx={{ p: 2, bgcolor: '#111827' }}>
 <Typography variant="h6" sx={{ mb: 1 }}>Risk Trend</Typography>
 <TrendLineChart data={data.risk_trend} />
 </Paper>
 </Grid>
 </Grid>
 </Box>
 );
}
