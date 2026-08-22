import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../../lib/apiClient';

interface Action {
 id: string;
 title: string;
 description: string;
 priority: string;
 status: string;
 category: string;
}

export default function RemediationConsole() {
 const { findingId } = useParams();
 const [value, setValue] = useState(0);
 const [actions, setActions] = useState<Action[]>([]);

 useEffect(() => {
 api.get('/remediation/actions').then(r => setActions(r.data));
 }, []);

 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 2 }}>Remediation Console</Typography>
 <Paper sx={{ width: '100%' }}>
 <Tabs value={value} onChange={(_, v) => setValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
 <Tab label="Plans" />
 <Tab label="Actions" />
 <Tab label="Policy" />
 <Tab label="Templates" />
 <Tab label="Changelog" />
 </Tabs>
 <Box sx={{ p: 3 }}>
 {value === 1 && (
 <>
 {actions.map((a) => (
 <Paper key={a.id} sx={{ p: 2, mb: 2, bgcolor: '#111827' }}>
 <Typography sx={{ fontWeight: 600 }}>{a.title}</Typography>
 <Typography variant="body2" sx={{ color: 'grey.400' }}>{a.description}</Typography>
 <Typography variant="caption" sx={{ mt: 1, color: a.priority === 'critical' ? '#f44336' : '#ffd54f' }}>
 {a.priority} · {a.status}
 </Typography>
 </Paper>
 ))}
 </>
 )}
 {[0, 2, 3, 4].includes(value) && (
 <Typography sx={{ color: 'grey.400' }}>Select a tab to view content.</Typography>
 )}
 </Box>
 </Paper>
 </Box>
 );
}
