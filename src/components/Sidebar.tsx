import {
 Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
 IconButton, Toolbar, Typography,
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { authApi } from '../api/auth';

const drawerWidth = 260;

const navItems = [
 { text: 'Dashboard', path: '/dashboard' },
 { text: 'Assets', path: '/assets' },
 { text: 'Attack Paths', path: '/paths' },
 { text: 'Live Monitoring', path: '/live' },
 { text: 'URL Trust', path: '/urltrust' },
 { text: 'Reports', path: '/reports' },
 { text: 'Admin', path: '/admin' },
];

interface SidebarProps {
 mobileOpen: boolean;
 onClose: () => void;
 icons: Record<string, React.ReactNode>;
}

export default function Sidebar({ mobileOpen, onClose, icons }: SidebarProps) {
 const handleLogout = async () => {
 try { await authApi.logout(); } catch {}
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
 href={item.path}
 onClick={() => {
 if (window.innerWidth < 900) onClose();
 }}
 sx={{ mx: 1, borderRadius: 2, '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.08)' } }}
 >
 <ListItemIcon sx={{ color: '#42a5f5', minWidth: 40 }}>{icons[item.text]}</ListItemIcon>
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
 <>
 <Drawer
 variant="temporary"
 open={mobileOpen}
 onClose={onClose}
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
 </>
 );
}
