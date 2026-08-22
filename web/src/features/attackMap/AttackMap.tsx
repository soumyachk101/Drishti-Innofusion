import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Chip, Paper } from '@mui/material';
import { fetchGraph } from '../../api/graph';
import { useAuth } from '../../contexts/AuthContext';

const DEFAULT_NODES: Node[] = [
  { id: '1', position: { x: 50, y: 150 }, data: { label: 'INTERNET\n(Entry)' }, style: { background: '#ef4444', color: '#fff', borderRadius: 8, padding: 10, border: '2px solid #f87171' } },
  { id: '2', position: { x: 250, y: 100 }, data: { label: 'Edge Firewall\n(192.168.1.1)' }, style: { background: '#f59e0b', color: '#fff', borderRadius: 8, padding: 10 } },
  { id: '3', position: { x: 450, y: 80 }, data: { label: 'Web Server\n(192.168.1.10)' }, style: { background: '#eab308', color: '#000', borderRadius: 8, padding: 10 } },
  { id: '4', position: { x: 700, y: 150 }, data: { label: 'Crown Jewel DB\n(10.0.0.5)' }, style: { background: '#dc2626', color: '#fff', borderRadius: 8, padding: 10, border: '3px solid #fca5a5' } },
  { id: '5', position: { x: 450, y: 250 }, data: { label: 'Internal App\n(192.168.1.20)' }, style: { background: '#10b981', color: '#fff', borderRadius: 8, padding: 10 } },
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, label: 'Exposure' },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 }, label: 'Admin (SSH)' },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#dc2626', strokeWidth: 3 }, label: 'Chained SQLi' },
  { id: 'e2-5', source: '2', target: '5', animated: false, style: { stroke: '#10b981' }, label: 'Trust' },
  { id: 'e5-4', source: '5', target: '4', animated: false, style: { stroke: '#6b7280' }, label: 'Network' },
];

export default function AttackMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_EDGES);
  const [criticality, setCriticality] = useState('all');
  const { user } = useAuth();

  const load = useCallback(async () => {
    try {
      const data = await fetchGraph(user?.org_id, criticality);
      if (data && data.nodes && data.nodes.length > 0) {
        const nxNodes = data.nodes.map((n: any, idx: number) => ({
          id: String(n.id),
          type: 'default',
          position: {
            x: n.x ?? (100 + (idx % 4) * 220),
            y: n.y ?? (80 + Math.floor(idx / 4) * 140),
          },
          data: { label: `${n.label || n.hostname || n.ip || 'Host'}\n(${n.asset_type || n.type || 'server'})` },
          style: {
            background: n.criticality === 'critical' ? '#dc2626' : n.criticality === 'high' ? '#ea580c' : '#10b981',
            color: '#fff',
            borderRadius: 8,
            padding: 10,
            border: n.on_top_path ? '3px solid #f87171' : '1px solid #374151',
          },
        }));
        setNodes(nxNodes);
        if (data.edges) {
          setEdges(data.edges.map((e: any) => ({
            id: String(e.id || `${e.source}->${e.target}`),
            source: String(e.source),
            target: String(e.target),
            animated: Boolean(e.on_top_path || e.animated),
            label: e.relation || e.label || '',
            style: { stroke: e.on_top_path ? '#dc2626' : '#6b7280', strokeWidth: e.on_top_path ? 2.5 : 1.5 },
          })));
        }
      }
    } catch {
      // keep fallback default nodes/edges
    }
  }, [user?.org_id, criticality, setNodes, setEdges]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#fff' }}>
        Network Attack Surface Map
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: '#9ca3af' }}>Criticality</InputLabel>
          <Select value={criticality} label="Criticality" onChange={(e) => setCriticality(e.target.value)}>
            <MenuItem value="all">All Assets</MenuItem>
            <MenuItem value="critical">Critical Only</MenuItem>
            <MenuItem value="high">High & Above</MenuItem>
          </Select>
        </FormControl>
        <Chip
          label="Refresh Graph"
          onClick={load}
          sx={{ cursor: 'pointer', bgcolor: '#00e676', color: '#000', fontWeight: 600 }}
        />
      </Box>
      <Paper sx={{ height: 620, bgcolor: '#0a0e17', border: '1px solid #1f2937', borderRadius: 2, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#1f2937" gap={24} />
          <Controls />
          <MiniMap nodeStrokeColor="#00e676" nodeColor="#1f2937" maskColor="rgba(10, 14, 23, 0.7)" />
        </ReactFlow>
      </Paper>
    </Box>
  );
}
