import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  Box,
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  Assignment,
  VolunteerActivism,
  Assessment,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';

const drawerWidth = 280;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    label: 'דשבורד',
    icon: <Dashboard />,
    path: '/dashboard',
    description: 'מסך ראשי וסטטיסטיקות',
  },
  {
    label: 'ניהול משתמשים',
    icon: <People />,
    path: '/users',
    description: 'ניהול משתמשי המערכת',
  },
  {
    label: 'ניהול מוצרים',
    icon: <Inventory />,
    path: '/products',
    description: 'ניהול מוצרים ומופעים',
  },
  {
    label: 'ניהול השאלות',
    icon: <Assignment />,
    path: '/loans',
    description: 'ניהול השאלות והחזרות',
  },
  {
    label: 'ניהול מתנדבים',
    icon: <VolunteerActivism />,
    path: '/volunteers',
    description: 'ניהול מתנדבים ופעילויות',
  },
  {
    label: 'ביקורת ולוגים',
    icon: <Assessment />,
    path: '/audit',
    description: 'לוגים וביקורת מערכת',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('שגיאת יציאה:', error);
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography variant="h6" noWrap component="div">
            מערכת לב חדוה
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            ברוך הבא, {user?.firstName} {user?.lastName}
          </Typography>
        </Box>
      </Toolbar>

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                minHeight: 64,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2,
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
                secondaryTypographyProps={{
                  fontSize: '12px',
                  sx: { opacity: 0.7 },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary="יציאה מהמערכת"
              secondary={`תפקיד: ${user?.role === 'ADMIN' ? 'מנהל' : 'משתמש'}`}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', sm: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;