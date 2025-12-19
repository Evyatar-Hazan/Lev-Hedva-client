import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  Assignment,
  VolunteerActivism,
  Assessment,
  Logout,
  Close,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks';
import { useTranslation } from 'react-i18next';
import { COLORS, colorUtils } from '../../theme/colors';
import { UserRole } from '../../lib/types';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // Audit - only admins
    if (item.path === '/audit' && user?.role !== UserRole.ADMIN) {
      return false;
    }
    // Volunteers can only see volunteers page
    if (user?.role === UserRole.VOLUNTEER) {
      return item.path === '/volunteers';
    }
    // Clients can only see loans page
    if (user?.role === UserRole.CLIENT) {
      return item.path === '/loans';
    }
    return true;
  });

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
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: { xs: '56px', sm: '64px' }, // מקום ל-navbar
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`,
          color: COLORS.text.onPrimary,
          p: 3,
          position: 'relative',
        }}
      >
        {/* Close button for mobile */}
        {isMobile && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              cursor: 'pointer',
              borderRadius: '50%',
              p: 1,
              '&:hover': {
                backgroundColor: colorUtils.withOpacity(COLORS.text.onPrimary, 0.1),
              },
            }}
            onClick={onClose}
          >
            <Close />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <img
              src="/logoLevChedva.png"
              alt="לב חדוה"
              style={{
                height: 32,
                width: 'auto',
                borderRadius: '4px',
              }}
            />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {t('sidebar.systemTitle')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.85rem' }}>
              {t('sidebar.systemSubtitle')}
            </Typography>
          </Box>
        </Box>

        {/* User Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: '12px',
            backgroundColor: colorUtils.withOpacity(COLORS.text.onPrimary, 0.1),
            border: `1px solid ${colorUtils.withOpacity(COLORS.text.onPrimary, 0.2)}`,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: COLORS.secondary.main,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {user?.firstName?.charAt(0)}
            {user?.lastName?.charAt(0)}
          </Avatar>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: COLORS.text.onPrimary,
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Chip
              label={
                user?.role
                  ? t(`sidebar.role${user.role.charAt(0) + user.role.slice(1).toLowerCase()}`)
                  : t('sidebar.roleUser')
              }
              size="small"
              sx={{
                height: '18px',
                fontSize: '0.7rem',
                backgroundColor: colorUtils.withOpacity(COLORS.text.onPrimary, 0.2),
                color: COLORS.text.onPrimary,
                mt: 0,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List sx={{ px: 2 }}>
          {filteredMenuItems.map((item, index) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: '12px',
                    minHeight: 56,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      backgroundColor: COLORS.primary.main,
                      color: COLORS.text.onPrimary,
                      boxShadow: `0 4px 12px ${colorUtils.withOpacity(COLORS.primary.main, 0.3)}`,
                      transform: 'translateX(-2px)',
                      '& .MuiListItemIcon-root': {
                        color: COLORS.text.onPrimary,
                        transform: 'scale(1.1)',
                      },
                      '&:hover': {
                        backgroundColor: COLORS.primary.dark,
                      },
                    },
                    '&:hover:not(.Mui-selected)': {
                      backgroundColor: COLORS.action.hover,
                      transform: 'translateX(-1px)',
                      '& .MuiListItemIcon-root': {
                        transform: 'scale(1.05)',
                        color: COLORS.primary.main,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      color: isSelected ? COLORS.text.onPrimary : COLORS.icon.default,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={!isSelected ? item.description : undefined}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      sx: {
                        opacity: 0.7,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2, opacity: 0.3 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '12px',
            minHeight: 48,
            color: COLORS.status.error,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: colorUtils.withOpacity(COLORS.status.error, 0.1),
              transform: 'translateX(-1px)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: 2,
              justifyContent: 'center',
              color: COLORS.status.error,
            }}
          >
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary={t('navigation.logout')}
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          />
        </ListItemButton>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 2,
            opacity: 0.6,
            fontSize: '0.7rem',
          }}
        >
          {t('sidebar.version')}
        </Typography>
      </Box>
    </Box>
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
        display: 'block',
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          border: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backgroundImage: 'none',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
