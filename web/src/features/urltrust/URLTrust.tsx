import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert } from '@mui/material';
import api from '../../lib/apiClient';

export default function URLTrust() {
 const [url, setUrl] = useState('');
 const [result, setResult] = useState<any>(null);
 const [loading, setLoading] = useState(false);

 const analyze = async () => {
 if (!url) return;
 setLoading(true);
 try {
 const res = await api.get('/urltrust/analyze', { params: { url } });
 setResult(res.data);
 } finally { setLoading(false); }
 };

 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 2 }}>URL Trust Analyzer</Typography>
 <Paper sx={{ p: 3, bgcolor: '#111827' }}>
 <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
 <TextField fullWidth label="URL" value={url} onChange={(e) => setUrl(e.target.value)}
 placeholder="https://example.com" />
 <Button variant="contained" onClick={analyze} disabled={loading} sx={{ bgcolor: '#00e676', color: '#000' }}>
 {loading ? 'Analyzing…' : 'Analyze'}
 </Button>
 </Box>
 {result && (
 <Alert severity={result.trust_score > 70 ? 'success' : 'warning'} sx={{ mb: 2 }}>
 Trust Score: {result.trust_score}/100 · {result.verdict}
 </Alert>
 )}
 </Paper>
 </Box>
 );
}
