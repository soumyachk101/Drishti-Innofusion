import React, { useState } from 'react';
import {
 AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon,
 ListItemText, Box, useMediaQuery, useTheme, IconButton, ListItemButton,
} from '@mui/material';
import {
 Dashboard as DashboardIcon,
 Map as MapIcon,
 Timeline as TimelineIcon,
 Warning as WarningIcon,
 Build as BuildIcon,
 Visibility as VisibilityIcon,
 Link as LinkIcon,
 Description as DescriptionIcon,
 Settings as SettingsIcon,
 Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
 { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
 { label: 'Attack Map', path: '/attack-map', icon: <MapIcon /> },
 { label: 'Attack Paths', path: '/paths', icon: <TimelineIcon /> },
 { label: 'Findings', path: '/findings', icon: <WarningIcon /> },
 { label: 'Remediation', path: '/remediation', icon: <BuildIcon /> },
 { label: 'Live Watch', path: '/live-watch', icon: <VisibilityIcon /> },
 { label: 'URL Analyzer', path: '/url-analyzer', icon: <LinkIcon /> },
 { label: 'Report', path: '/report', icon: <DescriptionIcon /> },
 { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
 const theme = useTheme();
 const mobile = useMediaQuery(theme.breakpoints.down('md'));
 const [open, setOpen] = useState(!mobile);
 const navigate = useNavigate();
 const location = useLocation();
 const { user, logout } = useAuth();

 const handleLogout = () => {
 logout();
 navigate('/login');
 };

 return (
 <Box sx={{ display: 'flex' }}>
 <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: '#0a0e17' }}>
 <Toolbar variant="dense">
 {mobile && (
 <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 1 }}>
 <MenuIcon />
 </IconButton>
 )}
 <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: '#00e676' }}>
 Drishti
 </Typography>
 <Typography variant="body2" sx={{ color: 'grey.400' }}>
 {user?.name} · {user?.role}
 </Typography>
 </Toolbar>
 </AppBar>
 <Drawer
 variant={mobile ? 'temporary' : 'persistent'}
 open={open}
 onClose={() => setOpen(false)}
 sx={{
 width: open ? DRAWER_WIDTH : 0,
 flexShrink: 0,
 '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
 }}
 ModalProps={{ keepMounted: true }}
 >
 <Toolbar />
 <Box sx={{ overflow: 'auto' }}>
 <List>
 {NAV_ITEMS.map((item) => (
 <ListItemButton
 key={item.path}
 selected={location.pathname === item.path}
 onClick={() => { navigate(item.path); if (mobile) setOpen(false); }}
 sx={{
 '&.Mui-selected': { bgcolor: 'rgba(0,230,118,0.1)', borderRight: '3px solid #00e676' },
 }}
 >
 <ListItemIcon sx={{ color: location.pathname === item.path ? '#00e676' : 'grey.400' }}>
 {item.icon}
 </ListItemIcon>
 <ListItemText primary={item.label} />
 </ListItemButton>
 ))}
 </List>
 <Box sx={{ px: 2, mt: 2 }}>
 <ListItemButton onClick={handleLogout}>
 <ListItemIcon><SettingsIcon sx={{ color: 'grey.400' }} /></ListItemIcon>
 <ListItemText primary="Logout" />
 </ListItemButton>
 </Box>
 </Box>
 </Drawer>
 <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${open && !mobile ? DRAWER_WIDTH : 0}px`, mt: 7 }}>
 {children}
 </Box>
 </Box>
 );
}
