import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid } from '@mui/material';
import toast from 'react-hot-toast';

export default function SettingsPage() {
 const [orgName, setOrgName] = useState('Demo Organization');
 const [scanInterval, setScanInterval] = useState('3600');

 const save = () => {
 toast.success('Settings saved');
 };

 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 2 }}>Settings</Typography>
 <Grid container spacing={3}>
 <Grid item xs={12} md={6}>
 <Paper sx={{ p: 3, bgcolor: '#111827' }}>
 <Typography variant="h6" sx={{ mb: 2 }}>Organization</Typography>
 <TextField fullWidth label="Organization Name" value={orgName} onChange={(e) => setOrgName(e.target.value)}
 sx={{ mb: 2 }} />
 <Button variant="contained" onClick={save} sx={{ bgcolor: '#00e676', color: '#000' }}>Save</Button>
 </Paper>
 </Grid>
 <Grid item xs={12} md={6}>
 <Paper sx={{ p: 3, bgcolor: '#111827' }}>
 <Typography variant="h6" sx={{ mb: 2 }}>Scan Schedule</Typography>
 <TextField fullWidth label="Interval (seconds)" type="number" value={scanInterval}
 onChange={(e) => setScanInterval(e.target.value)} sx={{ mb: 2 }} />
 <Button variant="contained" onClick={save} sx={{ bgcolor: '#00e676', color: '#000' }}>Save</Button>
 </Paper>
 </Grid>
 </Grid>
 </Box>
 );
}
