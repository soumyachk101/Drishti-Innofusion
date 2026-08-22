import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import { Toaster } from 'react-hot-toast';

const theme = createTheme({
 palette: {
 mode: 'dark',
 primary: { main: '#00e676' },
 secondary: { main: '#ff6d00' },
 background: { default: '#0a0e17', paper: '#111827' },
 },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
 <BrowserRouter>
 <ThemeProvider theme={theme}>
 <CssBaseline />
 <AuthProvider>
 <App />
 <Toaster position="top-right" />
 </AuthProvider>
 </ThemeProvider>
 </BrowserRouter>
 </React.StrictMode>
);
