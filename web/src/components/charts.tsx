import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const COLORS = ['#f44336', '#ff9800', '#ffd54f', '#00e676', '#2196f3'];

export function RiskPieChart({ data }: { data: Record<string, number> }) {
 const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
 return (
 <ResponsiveContainer width="100%" height={280}>
 <PieChart>
 <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
 {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 );
}

export function RiskBarChart({ data }: { data: { type: string; risk: number }[] }) {
 return (
 <ResponsiveContainer width="100%" height={280}>
 <BarChart data={data}>
 <CartesianGrid strokeDasharray="3 3" stroke="#333" />
 <XAxis dataKey="type" tick={{ fill: '#9ca3af' }} />
 <YAxis tick={{ fill: '#9ca3af' }} />
 <Tooltip />
 <Bar dataKey="risk" fill="#00e676" />
 </BarChart>
 </ResponsiveContainer>
 );
}

export function TrendLineChart({ data }: { data: { date: string; score: number }[] }) {
 return (
 <ResponsiveContainer width="100%" height={280}>
 <LineChart data={data}>
 <CartesianGrid strokeDasharray="3 3" stroke="#333" />
 <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} />
 <YAxis tick={{ fill: '#9ca3af' }} />
 <Tooltip />
 <Line type="monotone" dataKey="score" stroke="#00e676" strokeWidth={2} />
 </LineChart>
 </ResponsiveContainer>
 );
}
