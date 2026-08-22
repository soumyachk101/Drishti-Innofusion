import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import api from '../../lib/apiClient';

interface ThreatEvent {
 id: string;
 source_ip: string;
 event_type: string;
 severity: string;
 timestamp: string;
 description: string;
}

export default function LiveWatch() {
 const [events, setEvents] = useState<ThreatEvent[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 api.get('/live/threats?org_id=demo-org').then((r) => {
 setEvents(r.data.events || []);
 setLoading(false);
 });
 }, []);

 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 2 }}>Live Threat Watch</Typography>
 {loading && <CircularProgress />}
 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
 {events.map((e) => (
 <Paper key={e.id} sx={{ p: 2, bgcolor: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <Box>
 <Typography sx={{ fontWeight: 600 }}>{e.event_type}</Typography>
 <Typography variant="body2" sx={{ color: 'grey.400' }}>{e.description}</Typography>
 <Typography variant="caption" sx={{ color: 'grey.500' }}>{e.timestamp} · {e.source_ip}</Typography>
 </Box>
 <Chip label={e.severity} size="small" sx={{
 bgcolor: e.severity === 'critical' ? '#f44336' : e.severity === 'high' ? '#ff9800' : '#ffd54f',
 color: '#000',
 }} />
 </Paper>
 ))}
 </Box>
 </Box>
 );
}
