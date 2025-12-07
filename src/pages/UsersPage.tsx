import React, { useState } from 'react';
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
import { format } from 'date-fns';

const UsersPage: React.FC = () => {
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
    role: roleFilter !== 'all' ? (roleFilter as any) : undefined,
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
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'volunteer': return 'info';
      case 'user': return 'default';
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
          שגיאה בטעינת נתוני המשתמשים: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          ניהול משתמשים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          הוספת משתמש
        </Button>
      </Box>

      {/* Debug Panel */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Debug:</strong> טוען: {isLoading ? 'כן' : 'לא'} | 
          שגיאה: {error ? (error as any).message || 'יש שגיאה' : 'אין'} | 
          נתונים: {usersData ? `${(usersData as any).users?.length || 0} מתוך ${(usersData as any).total || 0}` : 'אין'}
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
          <InputLabel>תפקיד</InputLabel>
          <Select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            label="תפקיד"
          >
            <MenuItem value="all">כל התפקידים</MenuItem>
            <MenuItem value="admin">מנהל מערכת</MenuItem>
            <MenuItem value="manager">מנהל</MenuItem>
            <MenuItem value="volunteer">מתנדב</MenuItem>
            <MenuItem value="user">משתמש</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* טבלת משתמשים */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם מלא</TableCell>
              <TableCell>אימייל</TableCell>
              <TableCell>טלפון</TableCell>
              <TableCell>תפקיד</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>תאריך הצטרפות</TableCell>
              <TableCell>פעולות</TableCell>
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
                  לא נמצאו משתמשים
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
            מציג {(usersData as any).users?.length || 0} מתוך {(usersData as any).total} משתמשים
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UsersPage;