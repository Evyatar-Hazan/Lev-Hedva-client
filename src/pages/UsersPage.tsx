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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useToggleUserStatus } from '../hooks';
import { UserRole, CreateUserDto, UpdateUserDto } from '../lib/types';
import { format } from 'date-fns';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.CLIENT,
    isActive: true,
  });
  
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

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const toggleUserStatusMutation = useToggleUserStatus();

  // Debug logging
  console.log('👥 Users Page Debug:', {
    usersData,
    isLoading,
    error,
    search,
    roleFilter,
    page,
    usersCount: usersData?.users?.length
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1); // איפוס לעמוד ראשון בחיפוש
  };

  const handleRoleFilterChange = (event: any) => {
    setRoleFilter(event.target.value);
    setPage(1);
  };

  const handleAddUser = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewUser({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: UserRole.CLIENT,
      isActive: true,
    });
  };

  const handleSaveUser = async () => {
    try {
      await createUserMutation.mutateAsync(newUser);
      handleCloseAddDialog();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUserFieldChange = (field: keyof CreateUserDto, value: any) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleSaveEditUser = async () => {
    try {
      if (editingUser) {
        await updateUserMutation.mutateAsync({
          id: editingUser.id,
          userData: {
            firstName: editingUser.firstName,
            lastName: editingUser.lastName,
            email: editingUser.email,
            phone: editingUser.phone,
            role: editingUser.role,
            isActive: editingUser.isActive,
          }
        });
        handleCloseEditDialog();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleEditUserFieldChange = (field: string, value: any) => {
    setEditingUser((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatusMutation.mutateAsync({ 
        id: userId, 
        isActive: !currentStatus 
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t('users.confirmDelete'))) {
      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
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
          onClick={handleAddUser}
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
            data: usersData ? `${usersData.users?.length || 0} מתוך ${usersData.total || 0}` : t('common.no')
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

      {/* טבלת משתמשים / כרטיסיות למובייל */}
      {isMobile ? (
        // תצוגת כרטיסיות למובייל
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : usersData?.users?.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>{t('users.noUsers')}</Typography>
            </Paper>
          ) : (
            usersData?.users?.map((user: any) => (
              <Card key={user.id} sx={{ p: 0 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Chip 
                      label={user.role} 
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('users.email')}:</strong> {user.email}
                  </Typography>
                  
                  {user.phone && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>{t('users.phone')}:</strong> {user.phone}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('users.status')}:</strong>{' '}
                    <Chip 
                      label={user.isActive ? 'פעיל' : 'לא פעיל'} 
                      color={getStatusColor(user.isActive) as any}
                      size="small"
                    />
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('users.joinDate')}:</strong> {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    title="עריכה"
                    onClick={() => handleEditUser(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color={user.isActive ? 'warning' : 'success'}
                    title={user.isActive ? 'השבתה' : 'הפעלה'}
                    onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                    disabled={toggleUserStatusMutation.isPending}
                  >
                    {user.isActive ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error" 
                    title="מחיקה"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deleteUserMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      ) : (
        // תצוגת טבלה לדסקטופ
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
              ) : usersData?.users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    {t('users.noUsers')}
                  </TableCell>
                </TableRow>
              ) : (
                usersData?.users?.map((user: any) => (
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
                      <IconButton 
                        size="small" 
                        color="primary" 
                        title="עריכה"
                        onClick={() => handleEditUser(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color={user.isActive ? 'warning' : 'success'}
                        title={user.isActive ? 'השבתה' : 'הפעלה'}
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        disabled={toggleUserStatusMutation.isPending}
                      >
                        {user.isActive ? <LockIcon /> : <LockOpenIcon />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        title="מחיקה"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {usersData?.total && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2">
            {t('users.pagination', { 
              showing: usersData.users?.length || 0, 
              total: usersData.total 
            })}
          </Typography>
        </Box>
      )}

      {/* Add User Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {t('users.addUser')}
            </Typography>
            <IconButton onClick={handleCloseAddDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('users.firstName')}
                value={newUser.firstName}
                onChange={(e) => handleUserFieldChange('firstName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('users.lastName')}
                value={newUser.lastName}
                onChange={(e) => handleUserFieldChange('lastName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('users.email')}
                type="email"
                value={newUser.email}
                onChange={(e) => handleUserFieldChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('users.password')}
                type="password"
                value={newUser.password}
                onChange={(e) => handleUserFieldChange('password', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('users.phone')}
                value={newUser.phone}
                onChange={(e) => handleUserFieldChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('users.role')}</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => handleUserFieldChange('role', e.target.value)}
                  label={t('users.role')}
                >
                  <MenuItem value={UserRole.CLIENT}>{t('users.roles.user')}</MenuItem>
                  <MenuItem value={UserRole.VOLUNTEER}>{t('users.roles.volunteer')}</MenuItem>
                  <MenuItem value={UserRole.WORKER}>{t('users.roles.manager')}</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>{t('users.roles.admin')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newUser.isActive}
                    onChange={(e) => handleUserFieldChange('isActive', e.target.checked)}
                  />
                }
                label={t('users.activeUser')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveUser}
            variant="contained"
            disabled={createUserMutation.isPending || !newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName}
          >
            {createUserMutation.isPending ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('users.editUser')}
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('users.firstName')}
                value={editingUser?.firstName || ''}
                onChange={(e) => handleEditUserFieldChange('firstName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('users.lastName')}
                value={editingUser?.lastName || ''}
                onChange={(e) => handleEditUserFieldChange('lastName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('users.email')}
                type="email"
                value={editingUser?.email || ''}
                onChange={(e) => handleEditUserFieldChange('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('users.phone')}
                value={editingUser?.phone || ''}
                onChange={(e) => handleEditUserFieldChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('users.role')}</InputLabel>
                <Select
                  value={editingUser?.role || UserRole.CLIENT}
                  onChange={(e) => handleEditUserFieldChange('role', e.target.value)}
                  label={t('users.role')}
                >
                  <MenuItem value={UserRole.CLIENT}>{t('users.roles.user')}</MenuItem>
                  <MenuItem value={UserRole.VOLUNTEER}>{t('users.roles.volunteer')}</MenuItem>
                  <MenuItem value={UserRole.WORKER}>{t('users.roles.manager')}</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>{t('users.roles.admin')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingUser?.isActive || false}
                    onChange={(e) => handleEditUserFieldChange('isActive', e.target.checked)}
                  />
                }
                label={t('users.activeUser')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveEditUser}
            variant="contained"
            disabled={updateUserMutation.isPending || !editingUser?.email || !editingUser?.firstName || !editingUser?.lastName}
          >
            {updateUserMutation.isPending ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;