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
import { useTranslation } from 'react-i18next';

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

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      label: t('navigation.dashboard'),
      icon: <Dashboard />,
      path: '/dashboard',
      description: t('descriptions.dashboard'),
    },
    {
      label: t('navigation.users'),
      icon: <People />,
      path: '/users',
      description: t('descriptions.users'),
    },
    {
      label: t('navigation.products'),
      icon: <Inventory />,
      path: '/products',
      description: t('descriptions.products'),
    },
    {
      label: t('navigation.loans'),
      icon: <Assignment />,
      path: '/loans',
      description: t('descriptions.loans'),
    },
    {
      label: t('navigation.volunteers'),
      icon: <VolunteerActivism />,
      path: '/volunteers',
      description: t('descriptions.volunteers'),
    },
    {
      label: t('navigation.audit'),
      icon: <Assessment />,
      path: '/audit',
      description: t('descriptions.audit'),
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error(t('auth.logoutError'), error);
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <img 
            src="/logoLevChedva.png" 
            alt="לב חדוה" 
            style={{ 
              height: 32, 
              width: 'auto'
            }} 
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div">
              {t('sidebar.systemTitle')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {t('sidebar.welcomeUser', { firstName: user?.firstName, lastName: user?.lastName })}
            </Typography>
          </Box>
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
              primary={t('navigation.logout')}
              secondary={t('sidebar.userRole', { 
                role: user?.role === 'ADMIN' ? t('sidebar.roleAdmin') : t('sidebar.roleUser')
              })}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Drawer
      variant="temporary"
      anchor="left"
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