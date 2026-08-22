import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
 const [form, setForm] = useState({ name: '', email: '', password: '', org_name: '' });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const { register } = useAuth();

 const submit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setLoading(true);
 try {
 await register(form);
 window.location.href = '/';
 } catch (err: any) {
 setError(err.message || 'Registration failed');
 } finally { setLoading(false); }
 };

 return (
 <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
 <Paper sx={{ p: 4, width: '100%', bgcolor: '#111827' }}>
 <Typography variant="h4" align="center" sx={{ mb: 1, color: '#00e676' }}>Create Account</Typography>
 {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
 <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
 {[
 { label: 'Full Name', key: 'name', type: 'text' },
 { label: 'Email', key: 'email', type: 'email' },
 { label: 'Organization Name', key: 'org_name', type: 'text' },
 { label: 'Password', key: 'password', type: 'password' },
 ].map((f) => (
 <TextField
 key={f.key} fullWidth label={f.label} type={f.type}
 value={(form as any)[f.key]}
 onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
 InputLabelProps={{ style: { color: '#9ca3af' } }}
 />
 ))}
 <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#00e676', color: '#000' }}>
 {loading ? 'Creating…' : 'Create Account'}
 </Button>
 </Box>
 <Typography variant="body2" align="center" sx={{ mt: 2, color: 'grey.400' }}>
 Have an account? <Link component={RouterLink} to="/login" sx={{ color: '#00e676' }}>Sign In</Link>
 </Typography>
 </Paper>
 </Container>
 );
}
