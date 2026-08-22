import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import api from '../../lib/apiClient';

export default function Report() {
 const generate = async () => {
 const res = await api.get('/reports/generate');
 window.open(res.data.report_url, '_blank');
 };

 const exportPdf = async () => {
 const res = await api.get('/reports/export/pdf');
 window.open(res.data.download_url, '_blank');
 };

 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 2 }}>Reports</Typography>
 <Grid container spacing={3}>
 <Grid item xs={12} md={6}>
 <Paper sx={{ p: 3, bgcolor: '#111827' }}>
 <Typography variant="h6" sx={{ mb: 2 }}>Generate Report</Typography>
 <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>Generate a comprehensive security assessment report.</Typography>
 <Button variant="contained" startIcon={<PdfIcon />} onClick={generate} sx={{ bgcolor: '#00e676', color: '#000' }}>
 Generate Report
 </Button>
 </Paper>
 </Grid>
 <Grid item xs={12} md={6}>
 <Paper sx={{ p: 3, bgcolor: '#111827' }}>
 <Typography variant="h6" sx={{ mb: 2 }}>Export PDF</Typography>
 <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>Export current findings as PDF document.</Typography>
 <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportPdf}>
 Export PDF
 </Button>
 </Paper>
 </Grid>
 </Grid>
 </Box>
 );
}
