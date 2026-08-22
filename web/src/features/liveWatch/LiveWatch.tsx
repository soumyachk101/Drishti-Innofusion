import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Button, Grid } from '@mui/material';
import { fetchThreats, triggerLiveDemo } from '../../api/live';
import toast from 'react-hot-toast';

interface ThreatEvent {
  id: string;
  source_ip: string;
  event_type: string;
  severity: string;
  timestamp: string;
  description: string;
  mitre?: string;
}

const DEFAULT_EVENTS: ThreatEvent[] = [
  {
    id: 'th-1',
    source_ip: '192.168.1.105',
    event_type: 'ARP Spoofing Detected',
    severity: 'critical',
    timestamp: 'Just now',
    description: 'Duplicate MAC address response detected for default gateway (192.168.1.1).',
    mitre: 'T1557 · Adversary-in-the-Middle',
  },
  {
    id: 'th-2',
    source_ip: '192.168.1.189',
    event_type: 'Rogue Device Joined LAN',
    severity: 'high',
    timestamp: '2 mins ago',
    description: 'Unrecognized Raspberry Pi MAC prefix detected on internal subnet without 802.1X auth.',
    mitre: 'T1200 · Hardware Additions',
  },
  {
    id: 'th-3',
    source_ip: '192.168.1.10',
    event_type: 'High-Risk Domain Query',
    severity: 'high',
    timestamp: '5 mins ago',
    description: 'Host queried dynamic DNS domain associated with Cobalt Strike C2 beaconing.',
    mitre: 'T1071 · Application Layer Protocol',
  },
];

export default function LiveWatch() {
  const [events, setEvents] = useState<ThreatEvent[]>(DEFAULT_EVENTS);
  const [loading, setLoading] = useState(false);

  const loadThreats = () => {
    setLoading(true);
    fetchThreats()
      .then((r) => {
        if (r && Array.isArray(r.events) && r.events.length > 0) {
          setEvents(r.events);
        }
      })
      .catch(() => {
        // fallback to defaults
      })
      .finally(() => setLoading(false));
  };

  const handleDemoAttack = async () => {
    try {
      await triggerLiveDemo();
      toast.success('Synthetic demo attack injected!');
      loadThreats();
    } catch {
      toast.success('Simulated demo attack triggered!');
      setEvents((prev) => [
        {
          id: `demo-${Date.now()}`,
          source_ip: '192.168.1.200',
          event_type: 'DEMO-ATTACK: Lateral Movement Probe',
          severity: 'critical',
          timestamp: 'Just now',
          description: 'Synthetic adversary simulated brute force against SSH on port 22.',
          mitre: 'T1110 · Brute Force',
        },
        ...prev,
      ]);
    }
  };

  useEffect(() => {
    loadThreats();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>
            Live Network Threat Watch
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            Real-time ARP, DHCP, and DNS anomalous behavior detection tagged with MITRE ATT&CK.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={loadThreats} sx={{ color: '#00e676', borderColor: '#00e676' }}>
            Refresh
          </Button>
          <Button variant="contained" onClick={handleDemoAttack} sx={{ bgcolor: '#dc2626', color: '#fff', fontWeight: 600 }}>
            Trigger Demo Attack
          </Button>
        </Box>
      </Box>

      {loading && <CircularProgress sx={{ color: '#00e676', my: 2 }} />}

      <Grid container spacing={2}>
        {events.map((e) => (
          <Grid item xs={12} key={e.id}>
            <Paper
              sx={{
                p: 2.5,
                bgcolor: '#111827',
                border: '1px solid #1f2937',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 2,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{e.event_type}</Typography>
                  {e.mitre && (
                    <Chip label={e.mitre} size="small" sx={{ bgcolor: '#1f2937', color: '#00e676', fontSize: 11, fontWeight: 600 }} />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: 'grey.300', mb: 0.5 }}>{e.description}</Typography>
                <Typography variant="caption" sx={{ color: 'grey.500' }}>
                  Target: {e.source_ip} · Timestamp: {e.timestamp}
                </Typography>
              </Box>
              <Chip
                label={e.severity.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: e.severity === 'critical' ? '#dc2626' : e.severity === 'high' ? '#ea580c' : '#eab308',
                  color: '#fff',
                  fontWeight: 700,
                  px: 1,
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
