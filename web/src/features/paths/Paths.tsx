import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const COLUMNS: GridColDef[] = [
 { field: 'id', headerName: 'ID', width: 80 },
 { field: 'label', headerName: 'Asset', flex: 1 },
 { field: 'type', headerName: 'Type', width: 120 },
 { field: 'criticality', headerName: 'Criticality', width: 120 },
 { field: 'risk_score', headerName: 'Risk', width: 100, type: 'number' },
 { field: 'cvss', headerName: 'CVSS', width: 80 },
 { field: 'vulns', headerName: 'Vulns', width: 80 },
];

export default function AttackPaths() {
 const rows = [
 { id: 1, label: 'web-prod-01', type: 'server', criticality: 'high', risk_score: 0.85, cvss: 9.1, vulns: 3 },
 { id: 2, label: 'db-primary', type: 'database', criticality: 'critical', risk_score: 0.92, cvss: 9.8, vulns: 2 },
 ];
 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 2 }}>Attack Paths</Typography>
 <Paper sx={{ height: 600 }}>
 <DataGrid rows={rows} columns={COLUMNS} pageSizeOptions={[10]} />
 </Paper>
 </Box>
 );
}
