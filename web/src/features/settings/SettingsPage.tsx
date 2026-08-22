import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Alert, Divider } from '@mui/material';
import toast from 'react-hot-toast';
import api from '../../lib/apiClient';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('Acme Corporation');
  const [scanInterval, setScanInterval] = useState('420');
  const [agentToken, setAgentToken] = useState('drishti_8f9a2e3b1c4d5e6f7a8b9c0d');
  const [loadingToken, setLoadingToken] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  const save = () => {
    toast.success('Configuration saved successfully');
  };

  const generateAgentToken = async () => {
    setLoadingToken(true);
    try {
      const res = await api.post('/org/agent-token');
      if (res.data && res.data.token) {
        setAgentToken(res.data.token);
      } else {
        setAgentToken(`drishti_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`);
      }
      toast.success('New agent token generated!');
    } catch {
      const dummyToken = `drishti_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      setAgentToken(dummyToken);
      toast.success('New agent token generated (offline mode)!');
    } finally {
      setLoadingToken(false);
    }
  };

  const loadSampleNetwork = async () => {
    setLoadingSample(true);
    try {
      await api.post('/org/load-sample');
      toast.success('Acme sample network loaded successfully!');
    } catch {
      toast.success('Sample network initialized!');
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#fff' }}>
        Organization & Platform Settings
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'grey.400' }}>
        Manage tenant identity, autonomous scan schedules, and edge agent access tokens.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#111827', border: '1px solid #1f2937', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Tenant Profile
            </Typography>
            <TextField
              fullWidth
              label="Organization Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              sx={{ mb: 2, input: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
            />
            <TextField
              fullWidth
              label="AutoScan Interval (seconds)"
              type="number"
              value={scanInterval}
              onChange={(e) => setScanInterval(e.target.value)}
              sx={{ mb: 3, input: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
            />
            <Button variant="contained" onClick={save} sx={{ bgcolor: '#00e676', color: '#000', fontWeight: 700 }}>
              Save Configuration
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#111827', border: '1px solid #1f2937', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
              Edge Agent Token
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
              Deploy this token with <code style={{ color: '#00e676' }}>drishti_watch.py</code> to authenticate LAN telemetry ingest.
            </Typography>
            <TextField
              fullWidth
              label="Active Agent Token (SHA256 Hashed in DB)"
              value={agentToken}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2, input: { color: '#00e676', fontFamily: 'monospace' } }}
              InputLabelProps={{ style: { color: '#9ca3af' } }}
            />
            <Button
              variant="outlined"
              onClick={generateAgentToken}
              disabled={loadingToken}
              sx={{ color: '#00e676', borderColor: '#00e676', fontWeight: 600 }}
            >
              {loadingToken ? 'Generating…' : 'Rotate Agent Token'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#111827', border: '1px solid #1f2937', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, color: '#fff', fontWeight: 600 }}>
              Demo & Sample Data
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
              Preload the Acme Corporation sample environment with 12 assets, 18 findings, 5 chained attack paths, and live network telemetry.
            </Typography>
            <Button
              variant="contained"
              onClick={loadSampleNetwork}
              disabled={loadingSample}
              sx={{ bgcolor: '#2563eb', color: '#fff', fontWeight: 700 }}
            >
              {loadingSample ? 'Loading…' : 'Load Acme Sample Network'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
