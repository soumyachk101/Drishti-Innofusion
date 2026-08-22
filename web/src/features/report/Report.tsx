import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function Report() {
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success('Executive Security Assessment generated!');
      window.print();
    }, 800);
  };

  const exportPdf = () => {
    toast.success('Exporting Report as PDF...');
    window.print();
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#fff' }}>
        Executive Security Reports
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'grey.400' }}>
        Download CISO-ready reports with dollar financial exposure metrics and prioritized remediation roadmaps.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#111827', border: '1px solid #1f2937', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#fff', fontWeight: 600 }}>
              Executive Exposure Summary
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 3 }}>
              Comprehensive board-level report featuring Total Enterprise Financial Exposure ($), top attack paths, and crown jewel vulnerability breakdown.
            </Typography>
            <Button
              variant="contained"
              startIcon={generating ? <CircularProgress size={18} sx={{ color: '#000' }} /> : <PdfIcon />}
              onClick={generate}
              disabled={generating}
              sx={{ bgcolor: '#00e676', color: '#000', fontWeight: 700 }}
            >
              {generating ? 'Generating…' : 'Generate & Print Report'}
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#111827', border: '1px solid #1f2937', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#fff', fontWeight: 600 }}>
              Technical Findings Export
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 3 }}>
              Detailed vulnerability catalog with CVSS scores, exploitability ease, asset associations, and Ansible remediation playbooks.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportPdf}
              sx={{ color: '#00e676', borderColor: '#00e676', fontWeight: 600 }}
            >
              Export PDF Document
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, bgcolor: '#111827', border: '1px solid #1f2937', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
          Latest Audit Highlights
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#0a0e17', border: '1px solid #1f2937' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'grey.400' }}>Current Financial Exposure</Typography>
                <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 700, mt: 0.5 }}>$902,900</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#0a0e17', border: '1px solid #1f2937' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'grey.400' }}>Projected Post-Remediation</Typography>
                <Typography variant="h5" sx={{ color: '#00e676', fontWeight: 700, mt: 0.5 }}>$250,000</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#0a0e17', border: '1px solid #1f2937' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'grey.400' }}>Net Risk Reduction</Typography>
                <Typography variant="h5" sx={{ color: '#ffd54f', fontWeight: 700, mt: 0.5 }}>-72.3%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
