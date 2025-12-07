import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Alert
} from '@mui/material';
import { Button, Input } from '../components/ui';
import { useAuth } from '../features/auth/hooks';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error('שגיאת התחברות:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            ברוכים הבאים ללב חדוה
          </Typography>
          <Typography variant="body1" color="text.secondary">
            היכנסו לחשבון שלכם כדי להמשיך
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Input
            fullWidth
            label="כתובת אימייל"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            dir="ltr"
          />
          
          <Input
            fullWidth
            label="סיסמה"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={isLoading}
            dir="ltr"
          />

          <Button
            type="submit"
            fullWidth
            variant="primary"
            size="large"
            loading={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            היכנס
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;