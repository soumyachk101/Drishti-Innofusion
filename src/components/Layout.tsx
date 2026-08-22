import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
 AppBar,
 Toolbar,
 Typography,
 Drawer,
 List,
 ListItem,
 ListItemButton,
 ListItemIcon,
 ListItemText,
 Box,
 IconButton,
 CssBaseline,
 useMediaQuery,
 useTheme,
} from '@mui/material';
import {
 Menu as MenuIcon,
 Dashboard as DashboardIcon,
 DevicesOther as AssetsIcon,
 AccountTree as PathsIcon,
 LiveTv as LiveIcon,
 Language as URLTrustIcon,
 Assessment as ReportsIcon,
 AdminPanelSettings as AdminIcon,
 Logout as LogoutIcon,
} from '@mui/icons-material';
import { authApi } from '../api/auth';

const drawerWidth = 260;

const navItems = [
 { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
 { text: 'Assets', path: '/assets', icon: <AssetsIcon /> },
 { text: 'Attack Paths', path: '/paths', icon: <PathsIcon /> },
 { text: 'Live Monitoring', path: '/live', icon: <LiveIcon /> },
 { text: 'URL Trust', path: '/urltrust', icon: <URLTrustIcon /> },
 { text: 'Reports', path: '/reports', icon: <ReportsIcon /> },
 { text: 'Admin', path: '/admin', icon: <AdminIcon /> },
];

export default function Layout() {
 const theme = useTheme();
 const isMobile = useMediaQuery(theme.breakpoints.down('md'));
 const [mobileOpen, setMobileOpen] = useState(false);

 const handleLogout = async () => {
 try {
 await authApi.logout();
 } catch {}
 localStorage.removeItem('access_token');
 localStorage.removeItem('refresh_token');
 window.location.href = '/login';
 };

 const drawerContent = (
 <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
 <Toolbar sx={{ background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)' }}>
 <Typography variant="h6" noWrap sx={{ color: '#fff', fontWeight: 700, letterSpacing: 1 }}>
 Drishti
 </Typography>
 </Toolbar>
 <Box sx={{ flexGrow: 1, py: 2 }}>
 <List>
 {navItems.map((item) => (
 <ListItem key={item.text} disablePadding>
 <ListItemButton
 component="a"
 href={item.path}
 onClick={(e) => {
 if (isMobile) {
 e.preventDefault();
 setMobileOpen(false);
 window.location.hash = item.path;
 }
 }}
 sx={{ mx: 1, borderRadius: 2, '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' } }}
 >
 <ListItemIcon sx={{ color: '#42a5f5', minWidth: 40 }}>{item.icon}</ListItemIcon>
 <ListItemText primary={item.text} />
 </ListItemButton>
 </ListItem>
 ))}
 </List>
 </Box>
 <Box sx={{ px: 2, pb: 2 }}>
 <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: '#f44336' }}>
 <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
 <ListItemText primary="Logout" />
 </ListItemButton>
 </Box>
 </Box>
 );

 return (
 <Box sx={{ display: 'flex' }}>
 <CssBaseline />
 <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
 <Toolbar sx={{ background: 'linear-gradient(90deg, #0d47a1 0%, #1565c0 100%)' }}>
 <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
 <MenuIcon />
 </IconButton>
 <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#fff' }}>
 Cybersecurity Platform
 </Typography>
 </Toolbar>
 </AppBar>
 <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
 <Drawer
 variant="temporary"
 open={mobileOpen}
 onClose={() => setMobileOpen(false)}
 ModalProps={{ keepMounted: true }}
 sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
 >
 {drawerContent}
 </Drawer>
 <Drawer
 variant="permanent"
 sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: '#0a1929', borderRight: '1px solid rgba(255,255,255,0.05)' } }}
 open
 >
 {drawerContent}
 </Drawer>
 </Box>
 <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', background: '#0a1929' }}>
 <Toolbar />
 <Outlet />
 </Box>
 </Box>
 );
}
