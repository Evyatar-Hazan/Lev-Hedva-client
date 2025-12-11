import React from 'react';
import {
  Box,
  Typography,
  Alert,
} from '@mui/material';
import {
  Person,
  Inventory,
  Assignment,
  Warning,
} from '@mui/icons-material';
import StatsGrid from '../components/StatsGrid';
import { useUsers, useProducts, useLoanStats } from '../hooks';
import { useAuth } from '../features/auth/hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({ limit: 1 });
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts({ limit: 1 });
  const { data: loanStats, isLoading: statsLoading, error: statsError } = useLoanStats();

  // Debug logging
  console.log('🔍 Dashboard Data:', { usersData, productsData, loanStats });
  
  // Extract counts with proper fallbacks
  const userCount = (usersData as any)?.total || 0;
  const productCount = (productsData as any)?.total || 0;
  const activeLoans = (loanStats as any)?.totalActiveLoans || 0;
  const overdueLoans = (loanStats as any)?.totalOverdueLoans || 0;

  if (!auth.isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <Typography variant="h6">{t('auth.pleaseLogin')}</Typography>
          <Typography>{t('auth.defaultCredentials.email')}</Typography>
          <Typography>{t('auth.defaultCredentials.password')}</Typography>
        </Alert>
      </Box>
    );
  }

  if (usersError || productsError || statsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">{t('dashboard.dataError')}</Typography>
          <Typography>{t('dashboard.serverUrl')}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography>
          <strong>{t('dashboard.debug')}</strong> {t('dashboard.debugInfo', { userCount, productCount, activeLoans })}
        </Typography>
      </Alert>
      
      <StatsGrid stats={[
        {
          icon: <Person />,
          value: userCount,
          label: t('dashboard.users'),
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          onClick: () => navigate('/users'),
          loading: usersLoading,
        },
        {
          icon: <Inventory />,
          value: productCount,
          label: t('dashboard.products'),
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          onClick: () => navigate('/products'),
          loading: productsLoading,
        },
        {
          icon: <Assignment />,
          value: activeLoans,
          label: t('dashboard.activeLoans'),
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          onClick: () => navigate('/loans'),
          loading: statsLoading,
        },
        {
          icon: <Warning />,
          value: overdueLoans,
          label: t('dashboard.overdue'),
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          onClick: () => navigate('/loans'),
          loading: statsLoading,
        },
      ]} />
    </Box>
  );
};

export default DashboardPage;
