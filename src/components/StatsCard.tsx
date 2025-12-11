import React from 'react';
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material';

interface StatsCardProps {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  gradient: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, gradient, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        '&:hover': onClick ? {
          transform: 'translateY(-4px) scale(1.01)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.1)',
          opacity: 0,
          transition: 'opacity 0.3s',
        },
        '&:hover::before': onClick ? {
          opacity: 1,
        } : {},
      }}
    >
      <CardContent 
        sx={{ 
          textAlign: 'center', 
          position: 'relative', 
          zIndex: 1, 
          py: isMobile ? 1.5 : 2,
          px: isMobile ? 1 : 2,
          '&:last-child': {
            pb: isMobile ? 1.5 : 2,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 1 : 1.5 }}>
          <Box 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              p: isMobile ? 0.75 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { fontSize: isMobile ? 24 : 32, color: 'white' }
            })}
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              fontWeight="bold" 
              sx={{ lineHeight: 1 }}
            >
              {value}
            </Typography>
            <Typography 
              variant={isMobile ? 'caption' : 'body2'} 
              sx={{ opacity: 0.9, fontWeight: 500, fontSize: isMobile ? '0.7rem' : '0.875rem' }}
            >
              {label}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
