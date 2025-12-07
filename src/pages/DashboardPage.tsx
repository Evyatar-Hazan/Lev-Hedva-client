import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person,
  Inventory,
  Assignment,
  Warning,
} from '@mui/icons-material';
import { useUsers, useProducts, useLoanStats } from '../hooks';
import { useAuth } from '../features/auth/hooks';
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
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

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography>
          <strong>{t('dashboard.debug')}</strong> {t('dashboard.debugInfo', { userCount, productCount, activeLoans })}
        </Typography>
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {usersLoading ? <CircularProgress size={24} /> : userCount}
                  </Typography>
                  <Typography variant="body2">{t('dashboard.users')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {productsLoading ? <CircularProgress size={24} /> : productCount}
                  </Typography>
                  <Typography variant="body2">{t('dashboard.products')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="info.main">
                    {statsLoading ? <CircularProgress size={24} /> : activeLoans}
                  </Typography>
                  <Typography variant="body2">{t('dashboard.activeLoans')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" color="error.main">
                    {statsLoading ? <CircularProgress size={24} /> : overdueLoans}
                  </Typography>
                  <Typography variant="body2">{t('dashboard.overdue')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
