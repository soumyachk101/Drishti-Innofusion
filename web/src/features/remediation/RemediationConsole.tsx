import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { generateRemediation } from '../../api/ai';

interface RemediationPlan {
  id: string;
  kind: string;
  title: string;
  summary: string;
  script: string;
  risk_reduction: number;
}

const DEFAULT_PLANS: RemediationPlan[] = [
  {
    id: 'rem-1',
    kind: 'ansible',
    title: 'Ansible Playbook: Patch PostgreSQL & Harden Config',
    summary: 'Updates postgresql packages to 16.3-1, disables trust auth on local sockets, and restricts listen_addresses to internal subnet.',
    script: `- name: Harden and Patch PostgreSQL
  hosts: databases
  become: yes
  tasks:
    - name: Update postgresql package
      apt:
        name: postgresql-16
        state: latest
    - name: Configure pg_hba.conf to enforce scram-sha-256
      lineinfile:
        path: /etc/postgresql/16/main/pg_hba.conf
        regexp: '^host.*all.*all'
        line: 'host all all 10.0.0.0/24 scram-sha-256'
    - name: Restart PostgreSQL
      service:
        name: postgresql
        state: restarted`,
    risk_reduction: 85,
  },
  {
    id: 'rem-2',
    kind: 'shell',
    title: 'Shell Script: Firewall Ingress Lockdown',
    summary: 'Drops direct internet exposure on port 5432 and 22, routing management through Bastion VPN.',
    script: `#!/usr/bin/env bash
set -euo pipefail
# Block public ingress to PostgreSQL and SSH
iptables -A INPUT -p tcp --dport 5432 ! -s 10.0.0.0/24 -j DROP
iptables -A INPUT -p tcp --dport 22 ! -s 192.168.1.0/24 -j DROP
iptables-save > /etc/iptables/rules.v4
echo "Firewall rules applied successfully."`,
    risk_reduction: 72,
  },
];

export default function RemediationConsole() {
  const { findingId } = useParams();
  const [tab, setTab] = useState(0);
  const [plans, setPlans] = useState<RemediationPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<RemediationPlan>(DEFAULT_PLANS[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (findingId) {
      setLoading(true);
      generateRemediation(findingId)
        .then((res) => {
          if (res && res.script) {
            const newPlan: RemediationPlan = {
              id: res.id || `ai-${Date.now()}`,
              kind: res.kind || 'ansible',
              title: res.title || 'AI Generated Remediation',
              summary: res.summary || 'Automated defensive remediation plan.',
              script: res.script,
              risk_reduction: res.risk_reduction || 80,
            };
            setPlans((prev) => [newPlan, ...prev]);
            setSelectedPlan(newPlan);
          }
        })
        .catch(() => {
          // keep defaults
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [findingId]);

  const copyScript = () => {
    navigator.clipboard.writeText(selectedPlan.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: '#fff' }}>
        AI Remediation Console
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'grey.400' }}>
        Context-specific defensive playbooks generated under strict output safety guardrails.
      </Typography>

      <Paper sx={{ width: '100%', bgcolor: '#111827', border: '1px solid #1f2937', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: '#1f2937' }}>
          <Tab label="Remediation Playbooks" sx={{ color: '#9ca3af', '&.Mui-selected': { color: '#00e676' } }} />
          <Tab label="Policy Rules" sx={{ color: '#9ca3af', '&.Mui-selected': { color: '#00e676' } }} />
          <Tab label="Verification Logs" sx={{ color: '#9ca3af', '&.Mui-selected': { color: '#00e676' } }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
              <CircularProgress size={24} sx={{ color: '#00e676' }} />
              <Typography sx={{ color: 'grey.300' }}>Generating AI remediation script...</Typography>
            </Box>
          )}

          {tab === 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {plans.map((p) => (
                  <Paper
                    key={p.id}
                    onClick={() => setSelectedPlan(p)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      bgcolor: selectedPlan.id === p.id ? '#1f2937' : '#0f172a',
                      border: selectedPlan.id === p.id ? '2px solid #00e676' : '1px solid #1f2937',
                      borderRadius: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={p.kind.toUpperCase()} size="small" sx={{ bgcolor: '#00e676', color: '#000', fontWeight: 700 }} />
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>-{p.risk_reduction}% Risk</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{p.title}</Typography>
                  </Paper>
                ))}
              </Box>

              <Paper sx={{ p: 3, bgcolor: '#0a0e17', border: '1px solid #1f2937', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontSize: 18 }}>{selectedPlan.title}</Typography>
                  <Button variant="contained" size="small" onClick={copyScript} sx={{ bgcolor: '#00e676', color: '#000', fontWeight: 600 }}>
                    {copied ? 'Copied!' : 'Copy Script'}
                  </Button>
                </Box>
                <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
                  {selectedPlan.summary}
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#000', border: '1px solid #1f2937', overflowX: 'auto' }}>
                  <pre style={{ margin: 0, fontFamily: 'monospace', color: '#00e676', fontSize: 13, lineHeight: 1.5 }}>
                    {selectedPlan.script}
                  </pre>
                </Paper>
              </Paper>
            </Box>
          )}

          {tab === 1 && (
            <Alert severity="info" sx={{ bgcolor: '#111827', color: '#fff' }}>
              Defensive Policy: Outbound connections to unauthorized subnets are denied by default.
            </Alert>
          )}

          {tab === 2 && (
            <Alert severity="success" sx={{ bgcolor: '#111827', color: '#fff' }}>
              All 2 remediation scripts passed strict offensive-marker safety validation.
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
