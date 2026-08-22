import React, { useState } from 'react';
import {
 Container, Paper, TextField, Button, Typography, Box, Alert, Link,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const { login } = useAuth();
 const navigate = useNavigate();

 const submit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setLoading(true);
 try {
 await login(email, password);
 toast.success('Welcome back!');
 navigate('/');
 } catch (err: any) {
 setError(err.message || 'Login failed');
 toast.error(err.message || 'Login failed');
 } finally { setLoading(false); }
 };

 return (
 <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
 <Paper sx={{ p: 4, width: '100%', bgcolor: '#111827' }}>
 <Typography variant="h4" align="center" sx={{ mb: 1, color: '#00e676', fontWeight: 700 }}>
 Drishti
 </Typography>
 <Typography variant="body2" align="center" sx={{ mb: 3, color: 'grey.400' }}>
 Network Risk Simulator
 </Typography>
 {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
 <form onSubmit={submit}>
 <TextField
 fullWidth label="Email" type="email" value={email}
 onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2, input: { color: '#fff' } }}
 InputLabelProps={{ style: { color: '#9ca3af' } }}
 />
 <TextField
 fullWidth label="Password" type="password" value={password}
 onChange={(e) => setPassword(e.target.value)} sx={{ mb: 3 }}
 InputLabelProps={{ style: { color: '#9ca3af' } }}
 />
 <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ bgcolor: '#00e676', color: '#000' }}>
 {loading ? 'Signing in…' : 'Sign In'}
 </Button>
 </form>
 <Typography variant="body2" align="center" sx={{ mt: 2, color: 'grey.400' }}>
 No account? <Link component={RouterLink} to="/register" sx={{ color: '#00e676' }}>Register</Link>
 </Typography>
 </Paper>
 </Container>
 );
}
