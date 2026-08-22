import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fetchPaths } from '../../api/paths';
import { useAuth } from '../../contexts/AuthContext';

const COLUMNS: GridColDef[] = [
  { field: 'id', headerName: 'Rank', width: 70 },
  { field: 'entry_label', headerName: 'Entry Point', width: 140 },
  { field: 'target', headerName: 'Target Crown Jewel', flex: 1 },
  { field: 'hop_count', headerName: 'Hops', width: 90 },
  {
    field: 'likelihood',
    headerName: 'Likelihood',
    width: 120,
    renderCell: (params) => (
      <span style={{ color: '#ffd54f', fontWeight: 600 }}>
        {(Number(params.value) * 100).toFixed(1)}%
      </span>
    ),
  },
  {
    field: 'impact_usd',
    headerName: 'Dollar Impact',
    width: 140,
    renderCell: (params) => (
      <span style={{ color: '#f44336', fontWeight: 700 }}>
        ${Number(params.value).toLocaleString()}
      </span>
    ),
  },
  {
    field: 'path_risk',
    headerName: 'Risk Score',
    width: 130,
    renderCell: (params) => {
      const score = Number(params.value);
      const color = score >= 75 ? '#dc2626' : score >= 50 ? '#ea580c' : '#10b981';
      return <Chip label={`${score.toFixed(1)}`} size="small" sx={{ bgcolor: color, color: '#fff', fontWeight: 700 }} />;
    },
  },
];

const DEFAULT_ROWS = [
  { id: 1, entry_label: 'INTERNET', target: 'PostgreSQL Main DB (10.0.0.5)', hop_count: 3, likelihood: 0.88, impact_usd: 902900, path_risk: 94.2 },
  { id: 2, entry_label: 'INTERNET', target: 'Customer Data Vault (10.0.0.8)', hop_count: 4, likelihood: 0.72, impact_usd: 750000, path_risk: 86.5 },
  { id: 3, entry_label: 'INTERNET', target: 'Payment Gateway API (192.168.1.50)', hop_count: 2, likelihood: 0.65, impact_usd: 520000, path_risk: 78.0 },
  { id: 4, entry_label: 'INTERNET', target: 'Internal Auth Keycloak (192.168.1.15)', hop_count: 3, likelihood: 0.54, impact_usd: 350000, path_risk: 69.4 },
];

export default function AttackPaths() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const { user } = useAuth();

  useEffect(() => {
    fetchPaths(user?.org_id)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(
            data.map((p: any, idx: number) => ({
              id: idx + 1,
              entry_label: p.entry_label || 'INTERNET',
              target: p.target_asset?.hostname || p.target_asset?.ip || `Asset #${p.target_asset_id || idx + 1}`,
              hop_count: p.hop_count || (p.steps ? p.steps.length : 3),
              likelihood: p.likelihood ?? 0.75,
              impact_usd: p.impact_usd ?? 500000,
              path_risk: p.path_risk ?? 75.0,
            }))
          );
        }
      })
      .catch(() => {
        // fallback to default demo rows
      });
  }, [user?.org_id]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#fff' }}>
        Bounded Attack Paths
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'grey.400' }}>
        Ranked Yen's k-shortest paths from internet entry points to critical crown-jewel assets.
      </Typography>
      <Paper sx={{ height: 560, bgcolor: '#111827', border: '1px solid #1f2937' }}>
        <DataGrid
          rows={rows}
          columns={COLUMNS}
          pageSizeOptions={[10]}
          sx={{
            color: '#fff',
            border: 'none',
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #1f2937' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#0a0e17', borderBottom: '1px solid #1f2937' },
          }}
        />
      </Paper>
    </Box>
  );
}
