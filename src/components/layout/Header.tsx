import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../../features/auth/hooks';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
import { COLORS } from '../../theme/colors';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: COLORS.primary.main,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <img 
            src="/logoLevChedva.png" 
            alt="לב חדוה" 
            style={{ 
              height: 32, 
              width: 'auto'
            }} 
          />
          <Typography variant="h6" noWrap component="div">
            {t('header.systemTitle')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageSelector />
          
          <Tooltip title={t('header.notifications')}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
          </Tooltip>

          <Tooltip title={`${user?.firstName} ${user?.lastName}`}>
            <IconButton color="inherit">
              <Avatar
                sx={{ 
                  width: 32, 
                  height: 32, 
                  backgroundColor: COLORS.secondary.main,
                  fontSize: '0.875rem',
                }}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;