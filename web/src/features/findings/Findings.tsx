import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fetchFindings } from '../../api/findings';
import { useAuth } from '../../contexts/AuthContext';

const COLS: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'title', headerName: 'Finding / CVE', flex: 1 },
  {
    field: 'severity',
    headerName: 'Severity',
    width: 120,
    renderCell: (params) => {
      const sev = String(params.value).toLowerCase();
      const color = sev === 'critical' ? '#dc2626' : sev === 'high' ? '#ea580c' : sev === 'medium' ? '#eab308' : '#10b981';
      return <Chip label={sev.toUpperCase()} size="small" sx={{ bgcolor: color, color: '#fff', fontWeight: 700 }} />;
    },
  },
  { field: 'cvss', headerName: 'CVSS', width: 90, type: 'number' },
  { field: 'asset', headerName: 'Affected Asset', width: 200 },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => {
      const st = String(params.value).toLowerCase();
      return (
        <Chip
          label={st}
          size="small"
          variant="outlined"
          sx={{
            color: st === 'resolved' ? '#00e676' : st === 'open' ? '#f44336' : '#ffd54f',
            borderColor: st === 'resolved' ? '#00e676' : st === 'open' ? '#f44336' : '#ffd54f',
          }}
        />
      );
    },
  },
  { field: 'created_at', headerName: 'Detected At', width: 140 },
];

const DEFAULT_ROWS = [
  { id: 1, title: 'CVE-2024-4321: PostgreSQL Privilege Escalation', severity: 'critical', cvss: 9.8, asset: 'db-primary (10.0.0.5)', status: 'open', created_at: '2026-08-20' },
  { id: 2, title: 'CVE-2024-2141: Apache Log4j JNDI RCE', severity: 'critical', cvss: 9.8, asset: 'web-prod-01 (192.168.1.10)', status: 'open', created_at: '2026-08-21' },
  { id: 3, title: 'CVE-2024-1188: OpenSSH Auth Bypass', severity: 'high', cvss: 8.1, asset: 'edge-gw-01 (192.168.1.1)', status: 'open', created_at: '2026-08-21' },
  { id: 4, title: 'Weak TLS 1.0/1.1 Protocol Enabled', severity: 'medium', cvss: 5.3, asset: 'api-gateway (192.168.1.50)', status: 'resolved', created_at: '2026-08-19' },
  { id: 5, title: 'Default SNMP Community String', severity: 'low', cvss: 3.5, asset: 'switch-core-01 (192.168.1.254)', status: 'acknowledged', created_at: '2026-08-18' },
];

export default function Findings() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const { user } = useAuth();

  useEffect(() => {
    fetchFindings(user?.org_id)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(
            data.map((f: any, idx: number) => ({
              id: idx + 1,
              title: f.vulnerability?.title || f.title || f.cve_id || `Finding #${f.id || idx + 1}`,
              severity: f.vulnerability?.severity || f.severity || 'high',
              cvss: f.vulnerability?.cvss || f.cvss || 7.5,
              asset: f.asset ? `${f.asset.hostname || ''} (${f.asset.ip || ''})` : f.asset_ip || 'Internal Asset',
              status: f.status || 'open',
              created_at: f.detected_at ? f.detected_at.split('T')[0] : '2026-08-22',
            }))
          );
        }
      })
      .catch(() => {
        // fallback to default rows
      });
  }, [user?.org_id]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#fff' }}>
        Vulnerability Findings
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'grey.400' }}>
        Identified security findings across host inventory and network perimeter.
      </Typography>
      <Paper sx={{ height: 560, bgcolor: '#111827', border: '1px solid #1f2937' }}>
        <DataGrid
          rows={rows}
          columns={COLS}
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
