import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsNone,
  Logout,
  Settings,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../features/auth/hooks';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
import { COLORS, colorUtils } from '../../theme/colors';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${colorUtils.withOpacity(COLORS.primary.light, 0.2)}`,
        left: 0,
        right: 0,
        width: '100%',
        borderRadius: '0 0 0px 0px',
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: { xs: 56, sm: 64 },
          px: 0, // הסרת padding מהצדדים
          mx: { xs: 2, sm: 3 }, // margin פנימי במקום padding
        }}
      >
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: { xs: 1, sm: 2 },
            padding: '8px',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: colorUtils.withOpacity(COLORS.text.onPrimary, 0.1),
              transform: 'scale(1.05)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and Title */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 }, 
            flexGrow: 1,
            minWidth: 0, // للسماح بالانكماش
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '8px',
              backgroundColor: colorUtils.withOpacity(COLORS.text.onPrimary, 0.1),
            }}
          >
            <img 
              src="/logoLevChedva.png" 
              alt="לב חדוה" 
              style={{ 
                height: isMobile ? 28 : 36, 
                width: 'auto',
                borderRadius: '4px',
              }} 
            />
          </Box>
          {!isMobile && (
            <Box>
              <Typography 
                variant="h6" 
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                {t('header.systemTitle')}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.8,
                  fontSize: '0.75rem',
                  display: 'block',
                  lineHeight: 1,
                }}
              >
                {t('header.systemSubtitle')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language Selector */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <LanguageSelector />
          </Box>
          
          {/* Notifications */}
          <Tooltip title={t('header.notifications')}>
            <IconButton 
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{
                padding: '8px',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: colorUtils.withOpacity(COLORS.text.onPrimary, 0.1),
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Badge badgeContent={3} color="secondary">
                <NotificationsNone />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title={`${user?.firstName} ${user?.lastName}`}>
            <IconButton 
              onClick={handleUserMenuOpen}
              sx={{
                padding: '4px',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: colorUtils.withOpacity(COLORS.text.onPrimary, 0.1),
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{ 
                    width: { xs: 32, sm: 36 }, 
                    height: { xs: 32, sm: 36 }, 
                    backgroundColor: COLORS.secondary.main,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    border: `2px solid ${colorUtils.withOpacity(COLORS.text.onPrimary, 0.2)}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </Avatar>
                {!isMobile && (
                  <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        lineHeight: 1.2,
                        fontSize: '0.875rem',
                      }}
                    >
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Chip
                      label={user?.role || 'משתמש'}
                      size="small"
                      sx={{
                        height: '16px',
                        fontSize: '0.65rem',
                        backgroundColor: colorUtils.withOpacity(COLORS.text.onPrimary, 0.2),
                        color: COLORS.text.onPrimary,
                      }}
                    />
                  </Box>
                )}
              </Box>
            </IconButton>
          </Tooltip>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          sx={{
            mt: 1,
            '& .MuiPaper-root': {
              borderRadius: '12px',
              minWidth: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${COLORS.border.light}`,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('menu.profile')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('menu.settings')}</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: COLORS.status.error }}>
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: COLORS.status.error }} />
            </ListItemIcon>
            <ListItemText>{t('auth.logout')}</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          sx={{
            mt: 1,
            '& .MuiPaper-root': {
              borderRadius: '12px',
              minWidth: 300,
              maxWidth: 400,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${COLORS.border.light}`,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t('header.notifications')}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNotificationsClose}>
            <ListItemText
              primary="הלוואה חדשה ממתינה לאישור"
              secondary="לפני 5 דקות"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose}>
            <ListItemText
              primary="מוצר חדש נוסף למלאי"
              secondary="לפני שעה"
            />
          </MenuItem>
          <MenuItem onClick={handleNotificationsClose}>
            <ListItemText
              primary="דוח חודשי מוכן לצפייה"
              secondary="אתמול"
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;