import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const COLS: GridColDef[] = [
 { field: 'id', headerName: 'ID', width: 60 },
 { field: 'title', headerName: 'Finding', flex: 1 },
 { field: 'severity', headerName: 'Severity', width: 110 },
 { field: 'cvss', headerName: 'CVSS', width: 80, type: 'number' },
 { field: 'asset', headerName: 'Asset', width: 180 },
 { field: 'status', headerName: 'Status', width: 120 },
 { field: 'created_at', headerName: 'Date', width: 120 },
];

const ROWS = [
 { id: 1, title: 'CVE-2024-XXXX: SQL Injection', severity: 'critical', cvss: 9.1, asset: 'db-primary', status: 'open', created_at: '2024-12-01' },
 { id: 2, title: 'CVE-2024-YYYY: XSS Vulnerability', severity: 'high', cvss: 7.5, asset: 'web-prod-01', status: 'open', created_at: '2024-12-02' },
 { id: 3, title: 'Weak TLS Configuration', severity: 'medium', cvss: 5.3, asset: 'api-gateway', status: 'acknowledged', created_at: '2024-12-03' },
];

export default function Findings() {
 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 2 }}>Findings</Typography>
 <Paper sx={{ height: 600 }}>
 <DataGrid rows={ROWS} columns={COLS} pageSizeOptions={[10]} />
 </Paper>
 </Box>
 );
}
