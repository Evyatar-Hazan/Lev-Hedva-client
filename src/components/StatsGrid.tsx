import React from 'react';
import { Grid, Box, CircularProgress } from '@mui/material';
import StatsCard from './StatsCard';

export interface StatItem {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  gradient: string;
  onClick?: () => void;
  loading?: boolean;
}

interface StatsGridProps {
  stats: StatItem[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <StatsCard
              icon={stat.icon}
              value={
                stat.loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : stat.value
              }
              label={stat.label}
              gradient={stat.gradient}
              onClick={stat.onClick}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsGrid;
