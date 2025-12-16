import React, { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { apiClient } from '../api/axios';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';

interface ConnectionStatusProps {
  children: React.ReactNode;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>(
    'checking'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('🔍 בודק חיבור לשרת...');

        // Try to ping the server
        await apiClient.get('/health');

        console.log('✅ חיבור לשרת תקין!');
        setConnectionStatus('connected');
      } catch (error: any) {
        console.error('❌ שגיאה בחיבור לשרת:', error);

        let message = 'שגיאה לא ידועה';

        if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
          message = 'השרת לא פועל. אנא ודא שהשרת רץ על http://localhost:3001';
        } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          message = 'שגיאת רשת. בדוק את החיבור לאינטרנט והגדרות CORS';
        } else if (error.response) {
          message = `שרת החזיר שגיאה: ${error.response.status} - ${error.response.statusText}`;
        } else {
          message = error.message || 'שגיאה בחיבור לשרת';
        }

        setErrorMessage(message);
        setConnectionStatus('error');
      }
    };

    checkConnection();

    // Recheck every 30 seconds if there's an error
    const interval = setInterval(() => {
      if (connectionStatus === 'error') {
        checkConnection();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [connectionStatus]);

  if (connectionStatus === 'checking') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={COLORS.background.soft}
      >
        <CircularProgress size={60} sx={{ color: COLORS.primary.main }} />
        <Typography variant="h6" sx={{ mt: 2, color: COLORS.text.secondary }}>
          🔍 בודק חיבור לשרת...
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: COLORS.text.hint }}>
          {t('connection.waitingForServer')}
        </Typography>
      </Box>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor={COLORS.background.soft}
        p={3}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            {t('connection.connectionError')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {errorMessage}
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('connection.retryInfo')}
        </Typography>

        <Box sx={{ textAlign: 'left', maxWidth: 600 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('connection.troubleshooting')}
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>{t('connection.solutions.checkServer')}</li>
            <li>
              {t('connection.solutions.runCommand')}{' '}
              <code>{t('connection.solutions.commandText')}</code>
            </li>
            <li>{t('connection.solutions.checkEnv')}</li>
            <li>{t('connection.solutions.checkFirewall')}</li>
          </Typography>
        </Box>
      </Box>
    );
  }

  // Connection is successful, render the app
  return <>{children}</>;
};

export default ConnectionStatus;
