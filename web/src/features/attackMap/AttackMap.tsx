import React, { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { fetchGraph } from '../../api/graph';

interface AssetNode {
 id: string;
 label: string;
 type: string;
 criticality: string;
 risk: number;
}

export default function AttackMap() {
 const [nodes, setNodes, onNodesChange] = useNodesState([]);
 const [edges, setEdges, onEdgesChange] = useEdgesState([]);
 const [orgId, setOrgId] = useState('');
 const [criticality, setCriticality] = useState('all');

 const load = useCallback(async () => {
 if (!orgId) return;
 const data = await fetchGraph(orgId, criticality);
 const nxNodes = data.nodes.map((n: AssetNode) => ({
 id: n.id,
 type: 'default',
 position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
 data: { label: `${n.label}\n(${n.type})` },
 style: {
 background: n.criticality === 'critical' ? '#f44336' : n.criticality === 'high' ? '#ff9800' : '#00e676',
 color: '#fff',
 border: '2px solid #fff',
 },
 }));
 setNodes(nxNodes);
 setEdges(data.edges.map((e: any) => ({ id: e.id, source: e.source, target: e.target, animated: true })));
 }, [orgId, criticality, setNodes, setEdges]);

 return (
 <Box>
 <Typography variant="h4" sx={{ mb: 2 }}>Attack Map</Typography>
 <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
 <FormControl size="small" sx={{ minWidth: 200 }}>
 <InputLabel>Organization</InputLabel>
 <Select value={orgId} label="Organization" onChange={(e) => setOrgId(e.target.value)}>
 <MenuItem value="demo-org">Demo Organization</MenuItem>
 </Select>
 </FormControl>
 <FormControl size="small" sx={{ minWidth: 150 }}>
 <InputLabel>Criticality</InputLabel>
 <Select value={criticality} label="Criticality" onChange={(e) => setCriticality(e.target.value)}>
 <MenuItem value="all">All</MenuItem>
 <MenuItem value="critical">Critical</MenuItem>
 <MenuItem value="high">High</MenuItem>
 </Select>
 </FormControl>
 <Chip label="Refresh" onClick={load} sx={{ cursor: 'pointer', bgcolor: '#00e676', color: '#000' }} />
 </Box>
 <Paper sx={{ height: 600, bgcolor: '#0a0e17' }}>
 <ReactFlow
 nodes={nodes}
 edges={edges}
 onNodesChange={onNodesChange}
 onEdgesChange={onEdgesChange}
 fitView
 >
 <Background color="#333" gap={20} />
 <Controls />
 <MiniMap />
 </ReactFlow>
 </Paper>
 </Box>
 );
}
