import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useUsers } from '../hooks';
import { UserRole } from '../lib/types';
import { format } from 'date-fns';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  
  // שימוש בהוק החדש
  const { 
    data: usersData, 
    isLoading, 
    error 
  } = useUsers({ 
    search: search || undefined,
    role: roleFilter !== 'all' ? (roleFilter as UserRole) : undefined,
    page,
    limit: 10
  });

  // Debug logging
  console.log('👥 Users Page Debug:', {
    usersData,
    isLoading,
    error,
    search,
    roleFilter,
    page
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1); // איפוס לעמוד ראשון בחיפוש
  };

  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value);
    setPage(1);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'WORKER': return 'warning';
      case 'VOLUNTEER': return 'info';
      case 'CLIENT': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('users.loadError')} {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t('users.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          {t('users.addUser')}
        </Button>
      </Box>

      {/* Debug Panel */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t('users.debug', { 
            loading: isLoading, 
            error: error ? (error as any).message || t('common.error') : t('common.no'), 
            data: usersData ? `${(usersData as any).users?.length || 0} מתוך ${(usersData as any).total || 0}` : t('common.no')
          })}
        </Typography>
      </Alert>

      {/* סרגל חיפוש וסינון */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="חיפוש משתמשים..."
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('users.filter.role')}</InputLabel>
          <Select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            label="תפקיד"
          >
            <MenuItem value="all">{t('users.roles.all')}</MenuItem>
            <MenuItem value={UserRole.ADMIN}>{t('users.roles.admin')}</MenuItem>
            <MenuItem value={UserRole.WORKER}>{t('users.roles.manager')}</MenuItem>
            <MenuItem value={UserRole.VOLUNTEER}>{t('users.roles.volunteer')}</MenuItem>
            <MenuItem value={UserRole.CLIENT}>{t('users.roles.user')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* טבלת משתמשים */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('users.fullName')}</TableCell>
              <TableCell>{t('users.email')}</TableCell>
              <TableCell>{t('users.phone')}</TableCell>
              <TableCell>{t('users.role')}</TableCell>
              <TableCell>{t('users.status')}</TableCell>
              <TableCell>{t('users.joinDate')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (usersData as any)?.users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  {t('users.noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              (usersData as any)?.users?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.isActive ? 'פעיל' : 'לא פעיל'} 
                      color={getStatusColor(user.isActive) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" title="עריכה">
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color={user.isActive ? 'warning' : 'success'}
                      title={user.isActive ? 'השבתה' : 'הפעלה'}
                    >
                      {user.isActive ? <LockIcon /> : <LockOpenIcon />}
                    </IconButton>
                    <IconButton size="small" color="error" title="מחיקה">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {(usersData as any)?.total && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2">
            {t('users.pagination', { 
              showing: (usersData as any).users?.length || 0, 
              total: (usersData as any).total 
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UsersPage;