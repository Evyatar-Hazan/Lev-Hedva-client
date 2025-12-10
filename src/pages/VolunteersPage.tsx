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
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  VolunteerActivism as VolunteerIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useVolunteerActivities, useCreateVolunteerActivity, useUpdateVolunteerActivity } from '../hooks';
import { useUsers } from '../hooks/useUsers';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { COLORS } from '../theme/colors';

const VolunteersPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    volunteerId: '',
    activityType: '',
    description: '',
    hours: '',
    date: ''
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  
  // שימוש בהוכים החדשים
  const { data: activitiesData, isLoading, error, refetch } = useVolunteerActivities({ 
    page,
    limit: 20
  });
  
  const { data: usersData } = useUsers();
  const createActivityMutation = useCreateVolunteerActivity();
  const updateActivityMutation = useUpdateVolunteerActivity();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'delivery': return 'primary';
      case 'home_visit': return 'secondary';
      case 'phone_call': return 'info';
      case 'maintenance': return 'warning';
      case 'other': return 'default';
      default: return 'default';
    }
  };

  const getActivityTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'delivery': return 'משלוח';
      case 'home_visit': return 'ביקור בית';
      case 'phone_call': return 'שיחה טלפונית';
      case 'maintenance': return 'תחזוקה';
      case 'other': return 'אחר';
      default: return type;
    }
  };

  const handleAddActivity = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setNewActivity({
      volunteerId: '',
      activityType: '',
      description: '',
      hours: '',
      date: ''
    });
    setSubmitError(null);
    setSelectedActivity(null);
  };

  const handleSubmitActivity = async () => {
    setSubmitError(null);
    try {
      if (selectedActivity) {
        // עדכון פעילות קיימת - ללא volunteerId
        const activityData = {
          activityType: newActivity.activityType,
          description: newActivity.description,
          hours: parseInt(newActivity.hours),
          date: new Date(newActivity.date).toISOString()
        };
        await updateActivityMutation.mutateAsync({
          id: selectedActivity.id,
          activityData
        });
      } else {
        // יצירת פעילות חדשה - עם volunteerId
        const activityData = {
          volunteerId: newActivity.volunteerId,
          activityType: newActivity.activityType,
          description: newActivity.description,
          hours: parseInt(newActivity.hours),
          date: new Date(newActivity.date).toISOString()
        };
        await createActivityMutation.mutateAsync(activityData);
      }
      
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error submitting activity:', error);
      setSubmitError(error?.response?.data?.message || error?.message || 'שגיאה בשמירת הפעילות');
    }
  };

  const handleViewActivity = (activity: any) => {
    setSelectedActivity(activity);
    setViewDialogOpen(true);
  };

  const handleEditActivity = (activity: any) => {
    setSelectedActivity(activity);
    setNewActivity({
      volunteerId: activity.volunteerId,
      activityType: activity.activityType,
      description: activity.description,
      hours: activity.hours.toString(),
      date: activity.date.split('T')[0] // Format date for input
    });
    setIsAddDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedActivity(null);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('volunteers.loadError')} {error.message}
        </Alert>
      </Box>
    );
  }

  const activities = activitiesData?.data || [];

  // סינון פעילויות לפי חיפוש ופילטר
  const filteredActivities = activities.filter(activity => {
    // סינון לפי חיפוש
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      activity.description.toLowerCase().includes(searchLower) ||
      activity.activityType.toLowerCase().includes(searchLower) ||
      `${activity.volunteer?.firstName} ${activity.volunteer?.lastName}`.toLowerCase().includes(searchLower);

    // סינון לפי סוג פעילות
    const matchesFilter = statusFilter === 'all' || activity.activityType === statusFilter;

    return matchesSearch && matchesFilter;
  });

  // קבלת סטטיסטיקות מתנדבים
  const volunteerStats = new Map();
  filteredActivities.forEach(activity => {
    const volunteerName = `${activity.volunteer?.firstName} ${activity.volunteer?.lastName}`;
    if (!volunteerStats.has(volunteerName)) {
      volunteerStats.set(volunteerName, {
        volunteer: activity.volunteer,
        totalActivities: 0,
        totalHours: 0,
        latestActivity: activity.createdAt
      });
    }
    const stats = volunteerStats.get(volunteerName);
    stats.totalActivities += 1;
    stats.totalHours += activity.hours || 0;
  });

  const volunteerStatsArray = Array.from(volunteerStats.values());

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t('volunteers.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            {t('common.refresh')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={handleAddActivity}
          >
            {t('volunteers.addActivity')}
          </Button>
        </Box>
      </Box>

      {/* סטטיסטיקות מהירות */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <VolunteerIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {volunteerStatsArray.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('volunteers.stats.activeVolunteers')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {activitiesData?.pagination?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('volunteers.stats.yearActivities')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimeIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {volunteerStatsArray.reduce((sum, v) => sum + v.totalHours, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('volunteers.stats.volunteerHours')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {volunteerStatsArray.filter(v => v.totalHours > 100).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('volunteers.stats.goldVolunteers')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* חיפוש וסינון */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="חיפוש מתנדבים או פעילויות..."
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('volunteers.filter.activityType')}</InputLabel>
          <Select
            value={statusFilter}
            label={t('volunteers.filter.activityType')}
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="all">{t('volunteers.activities.all')}</MenuItem>
            <MenuItem value="delivery">{t('volunteers.activities.delivery')}</MenuItem>
            <MenuItem value="home_visit">{t('volunteers.activities.home_visit')}</MenuItem>
            <MenuItem value="phone_call">{t('volunteers.activities.phone_call')}</MenuItem>
            <MenuItem value="maintenance">{t('volunteers.activities.maintenance')}</MenuItem>
            <MenuItem value="other">{t('volunteers.activities.other')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* טבלת פעילויות מתנדבים / כרטיסיות למובייל */}
      {isMobile ? (
        // תצוגת כרטיסיות למובייל
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredActivities.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>{t('volunteers.noActivities')}</Typography>
            </Paper>
          ) : (
            filteredActivities.map((activity: any) => (
              <Card key={activity.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: COLORS.primary.main }}>
                      {activity.volunteer?.firstName?.[0]}{activity.volunteer?.lastName?.[0]}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {activity.volunteer?.firstName} {activity.volunteer?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.volunteer?.email}
                      </Typography>
                    </Box>
                    <Chip 
                      label={getActivityTypeText(activity.activityType)}
                      color={getActivityTypeColor(activity.activityType)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>{t('volunteers.description')}:</strong> {activity.description || 'אין תיאור'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('volunteers.date')}:</strong> {format(new Date(activity.date), 'dd/MM/yyyy', { locale: he })}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('volunteers.hours')}:</strong> {activity.hours || 0}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton size="small" title="צפה" onClick={() => handleViewActivity(activity)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" title="ערוך" onClick={() => handleEditActivity(activity)}>
                    <EditIcon />
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
                <TableCell>{t('volunteers.volunteer')}</TableCell>
                <TableCell>{t('volunteers.activityType')}</TableCell>
                <TableCell>{t('volunteers.description')}</TableCell>
                <TableCell>{t('volunteers.date')}</TableCell>
                <TableCell align="center">{t('volunteers.hours')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {t('volunteers.noActivities')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity: any) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.primary.main }}>
                          {activity.volunteer?.firstName?.[0]}{activity.volunteer?.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {activity.volunteer?.firstName} {activity.volunteer?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.volunteer?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getActivityTypeText(activity.activityType)}
                        color={getActivityTypeColor(activity.activityType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.description || 'אין תיאור'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(activity.date), 'dd/MM/yyyy', { locale: he })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {activity.hours || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" title="צפה" onClick={() => handleViewActivity(activity)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton size="small" title="ערוך" onClick={() => handleEditActivity(activity)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* פגינציה */}
      {activitiesData?.pagination && activitiesData.pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3, gap: 2 }}>
          <Pagination 
            count={Math.ceil(activitiesData.pagination.total / activitiesData.pagination.limit)}
            page={activitiesData.pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
          <Typography variant="body2" color="text.secondary">
            {t('volunteers.pagination', { 
              page: activitiesData.pagination.page, 
              totalPages: Math.ceil(activitiesData.pagination.total / activitiesData.pagination.limit),
              total: activitiesData.pagination.total 
            })}
          </Typography>
        </Box>
      )}

      {/* דיאלוג הוספת/עריכת פעילות */}
      <Dialog open={isAddDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedActivity ? t('volunteers.editActivity') : t('volunteers.addActivity')}
        </DialogTitle>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={usersData?.users || []}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              value={usersData?.users?.find(u => u.id === newActivity.volunteerId) || null}
              onChange={(event, value) => {
                setNewActivity(prev => ({
                  ...prev,
                  volunteerId: value?.id || ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('volunteers.volunteer')}
                  required
                />
              )}
            />
            
            <FormControl fullWidth required>
              <InputLabel>{t('volunteers.activityType')}</InputLabel>
              <Select
                value={newActivity.activityType}
                onChange={(e) => setNewActivity(prev => ({
                  ...prev,
                  activityType: e.target.value
                }))}
                label={t('volunteers.activityType')}
              >
                <MenuItem value="delivery">{getActivityTypeText('delivery')}</MenuItem>
                <MenuItem value="home_visit">{getActivityTypeText('home_visit')}</MenuItem>
                <MenuItem value="phone_call">{getActivityTypeText('phone_call')}</MenuItem>
                <MenuItem value="maintenance">{getActivityTypeText('maintenance')}</MenuItem>
                <MenuItem value="other">{getActivityTypeText('other')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('volunteers.description')}
              value={newActivity.description}
              onChange={(e) => setNewActivity(prev => ({
                ...prev,
                description: e.target.value
              }))}
              multiline
              rows={3}
              required
            />

            <TextField
              label={t('volunteers.hours')}
              type="number"
              value={newActivity.hours}
              onChange={(e) => setNewActivity(prev => ({
                ...prev,
                hours: e.target.value
              }))}
              required
            />

            <TextField
              label={t('volunteers.date')}
              type="date"
              value={newActivity.date}
              onChange={(e) => setNewActivity(prev => ({
                ...prev,
                date: e.target.value
              }))}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitActivity}
            disabled={!newActivity.volunteerId || !newActivity.activityType || 
                     !newActivity.description || !newActivity.hours || !newActivity.date ||
                     createActivityMutation.isPending || updateActivityMutation.isPending}
            startIcon={(createActivityMutation.isPending || updateActivityMutation.isPending) ? <CircularProgress size={20} /> : null}
          >
            {selectedActivity ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג צפייה בפעילות */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('volunteers.viewActivity')}</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('volunteers.volunteer')}
                value={`${selectedActivity.volunteer?.firstName || ''} ${selectedActivity.volunteer?.lastName || ''}`}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
              
              <TextField
                label={t('volunteers.activityType')}
                value={getActivityTypeText(selectedActivity.activityType)}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />

              <TextField
                label={t('volunteers.description')}
                value={selectedActivity.description}
                InputProps={{ readOnly: true }}
                multiline
                rows={3}
                variant="outlined"
              />

              <TextField
                label={t('volunteers.hours')}
                value={selectedActivity.hours}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />

              <TextField
                label={t('volunteers.date')}
                value={format(new Date(selectedActivity.date), 'dd/MM/yyyy', { locale: he })}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
              
              <TextField
                label={t('volunteers.createdAt')}
                value={format(new Date(selectedActivity.createdAt), 'dd/MM/yyyy HH:mm', { locale: he })}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>
            {t('common.close')}
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleCloseViewDialog();
              handleEditActivity(selectedActivity);
            }}
            startIcon={<EditIcon />}
          >
            {t('common.edit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VolunteersPage;