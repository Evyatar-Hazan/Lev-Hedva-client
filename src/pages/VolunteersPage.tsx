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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
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
  Edit as EditIcon,
  VolunteerActivism as VolunteerIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import SearchAndFilter, { FilterOption, ActiveFilter } from '../components/SearchAndFilter';
import StatsGrid from '../components/StatsGrid';
import {
  useVolunteerActivities,
  useCreateVolunteerActivity,
  useUpdateVolunteerActivity,
} from '../hooks';
import { useUsers } from '../hooks/useUsers';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { COLORS } from '../theme/colors';

const VolunteersPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [page, setPage] = useState(1);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({
    volunteerId: '',
    activityType: '',
    description: '',
    hours: '',
    date: '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Using new hooks
  const {
    data: activitiesData,
    isLoading,
    error,
    refetch,
  } = useVolunteerActivities({
    page,
    limit: 20,
  });

  const { data: usersData } = useUsers();
  const createActivityMutation = useCreateVolunteerActivity();
  const updateActivityMutation = useUpdateVolunteerActivity();

  // Define available filters (after hooks are called)
  const availableFilters: FilterOption[] = [
    {
      id: 'activityType',
      label: t('volunteers.filter.activityType'),
      type: 'select',
      options: [
        { value: 'delivery', label: t('volunteers.activities.delivery') },
        { value: 'home_visit', label: t('volunteers.activities.home_visit') },
        { value: 'phone_call', label: t('volunteers.activities.phone_call') },
        { value: 'maintenance', label: t('volunteers.activities.maintenance') },
        { value: 'other', label: t('volunteers.activities.other') },
      ],
    },
    {
      id: 'volunteer',
      label: t('volunteers.filter.volunteer'),
      type: 'autocomplete',
      autocompleteOptions: usersData?.users?.filter((u: any) => u.role === 'VOLUNTEER') || [],
      getOptionLabel: (option: any) => `${option.firstName} ${option.lastName}`,
    },
    {
      id: 'date',
      label: t('volunteers.filter.date'),
      type: 'date',
    },
    {
      id: 'minHours',
      label: t('volunteers.filter.minHours'),
      type: 'text',
      placeholder: t('volunteers.filter.minHoursPlaceholder'),
    },
  ];

  // Functions for managing filters
  const handleFilterAdd = (filterId: string, value: any) => {
    const filterDef = availableFilters.find(f => f.id === filterId);
    if (!filterDef) return;

    let displayValue = value;
    if (filterDef.type === 'select' && filterDef.options) {
      const option = filterDef.options.find(o => o.value === value);
      displayValue = option?.label || value;
    }

    setActiveFilters(prev => [
      ...prev.filter(f => f.id !== filterId),
      {
        id: filterId,
        value,
        label: filterDef.label,
        displayValue,
      },
    ]);
    setPage(1);
  };

  const handleFilterRemove = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    setPage(1);
  };

  const handleClearAll = () => {
    setSearch('');
    setActiveFilters([]);
    setPage(1);
  };

  const getActivityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'delivery':
        return 'primary';
      case 'home_visit':
        return 'secondary';
      case 'phone_call':
        return 'info';
      case 'maintenance':
        return 'warning';
      case 'other':
        return 'default';
      default:
        return 'default';
    }
  };

  const getActivityTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'delivery':
        return 'משלוח';
      case 'home_visit':
        return 'ביקור בית';
      case 'phone_call':
        return 'שיחה טלפונית';
      case 'maintenance':
        return 'תחזוקה';
      case 'other':
        return 'אחר';
      default:
        return type;
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
      date: '',
    });
    setSubmitError(null);
    setSelectedActivity(null);
  };

  const handleSubmitActivity = async () => {
    setSubmitError(null);
    try {
      if (selectedActivity) {
        // Update existing activity - without volunteerId
        const activityData = {
          activityType: newActivity.activityType,
          description: newActivity.description,
          hours: parseInt(newActivity.hours),
          date: new Date(newActivity.date).toISOString(),
        };
        await updateActivityMutation.mutateAsync({
          id: selectedActivity.id,
          activityData,
        });
      } else {
        // Create new activity - with volunteerId
        const activityData = {
          volunteerId: newActivity.volunteerId,
          activityType: newActivity.activityType,
          description: newActivity.description,
          hours: parseInt(newActivity.hours),
          date: new Date(newActivity.date).toISOString(),
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
      date: activity.date.split('T')[0], // Format date for input
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

  // Filter activities by search and filters
  const filteredActivities = activities.filter(activity => {
    // Filter by search
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      activity.description.toLowerCase().includes(searchLower) ||
      activity.activityType.toLowerCase().includes(searchLower) ||
      `${activity.volunteer?.firstName} ${activity.volunteer?.lastName}`
        .toLowerCase()
        .includes(searchLower);

    // Apply all active filters
    const matchesFilters = activeFilters.every(filter => {
      if (filter.id === 'activityType') {
        return activity.activityType === filter.value;
      } else if (filter.id === 'volunteer') {
        return activity.volunteerId === filter.value.id;
      } else if (filter.id === 'date') {
        const filterDate = new Date(filter.value);
        const activityDate = new Date(activity.date);
        return activityDate.toDateString() === filterDate.toDateString();
      } else if (filter.id === 'minHours') {
        const minHours = parseFloat(filter.value);
        return activity.hours >= minHours;
      }
      return true;
    });

    return matchesSearch && matchesFilters;
  });

  // Get volunteer statistics
  const volunteerStats = new Map();
  filteredActivities.forEach(activity => {
    const volunteerName = `${activity.volunteer?.firstName} ${activity.volunteer?.lastName}`;
    if (!volunteerStats.has(volunteerName)) {
      volunteerStats.set(volunteerName, {
        volunteer: activity.volunteer,
        totalActivities: 0,
        totalHours: 0,
        latestActivity: activity.createdAt,
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
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
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

      {/* Quick statistics */}
      <StatsGrid
        stats={[
          {
            icon: <VolunteerIcon />,
            value: volunteerStatsArray.length,
            label: t('volunteers.stats.activeVolunteers'),
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
          {
            icon: <EventIcon />,
            value: activitiesData?.pagination?.total || 0,
            label: t('volunteers.stats.yearActivities'),
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          },
          {
            icon: <TimeIcon />,
            value: volunteerStatsArray.reduce((sum, v) => sum + v.totalHours, 0),
            label: t('volunteers.stats.totalHours'),
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          },
          {
            icon: <StarIcon />,
            value:
              volunteerStatsArray.length > 0
                ? Math.round(
                    (volunteerStatsArray.reduce((sum, v) => sum + v.totalHours, 0) /
                      volunteerStatsArray.length) *
                      10
                  ) / 10
                : 0,
            label: t('volunteers.stats.avgHoursPerVolunteer'),
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          },
        ]}
      />

      {/* Search and filter component */}
      <SearchAndFilter
        searchValue={search}
        onSearchChange={value => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t('volunteers.searchPlaceholder')}
        availableFilters={availableFilters}
        activeFilters={activeFilters}
        onFilterAdd={handleFilterAdd}
        onFilterRemove={handleFilterRemove}
        onClearAll={handleClearAll}
        disabled={isLoading}
      />

      {/* Activities table / mobile cards */}
      {isMobile ? (
        // Mobile card view
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
                      {activity.volunteer?.firstName?.[0]}
                      {activity.volunteer?.lastName?.[0]}
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
                    <strong>{t('volunteers.description')}:</strong>{' '}
                    {activity.description || 'אין תיאור'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('volunteers.date')}:</strong>{' '}
                    {format(new Date(activity.date), 'dd/MM/yyyy', { locale: he })}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('volunteers.hours')}:</strong> {activity.hours || 0}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton size="small" title="צפה" onClick={() => handleViewActivity(activity)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="ערוך"
                    onClick={() => handleEditActivity(activity)}
                  >
                    <EditIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      ) : (
        // Desktop table view
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
                          {activity.volunteer?.firstName?.[0]}
                          {activity.volunteer?.lastName?.[0]}
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
                      <Typography variant="body2">{activity.description || 'אין תיאור'}</Typography>
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
                      <IconButton
                        size="small"
                        title="צפה"
                        onClick={() => handleViewActivity(activity)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="ערוך"
                        onClick={() => handleEditActivity(activity)}
                      >
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

      {/* Pagination */}
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
              totalPages: Math.ceil(
                activitiesData.pagination.total / activitiesData.pagination.limit
              ),
              total: activitiesData.pagination.total,
            })}
          </Typography>
        </Box>
      )}

      {/* Add/Edit activity dialog */}
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
              getOptionLabel={option => `${option.firstName} ${option.lastName}`}
              value={usersData?.users?.find(u => u.id === newActivity.volunteerId) || null}
              onChange={(event, value) => {
                setNewActivity(prev => ({
                  ...prev,
                  volunteerId: value?.id || '',
                }));
              }}
              renderInput={params => (
                <TextField {...params} label={t('volunteers.volunteer')} required />
              )}
            />

            <FormControl fullWidth required>
              <InputLabel>{t('volunteers.activityType')}</InputLabel>
              <Select
                value={newActivity.activityType}
                onChange={e =>
                  setNewActivity(prev => ({
                    ...prev,
                    activityType: e.target.value,
                  }))
                }
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
              onChange={e =>
                setNewActivity(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              multiline
              rows={3}
              required
            />

            <TextField
              label={t('volunteers.hours')}
              type="number"
              value={newActivity.hours}
              onChange={e =>
                setNewActivity(prev => ({
                  ...prev,
                  hours: e.target.value,
                }))
              }
              required
            />

            <TextField
              label={t('volunteers.date')}
              type="date"
              value={newActivity.date}
              onChange={e =>
                setNewActivity(prev => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSubmitActivity}
            disabled={
              !newActivity.volunteerId ||
              !newActivity.activityType ||
              !newActivity.description ||
              !newActivity.hours ||
              !newActivity.date ||
              createActivityMutation.isPending ||
              updateActivityMutation.isPending
            }
            startIcon={
              createActivityMutation.isPending || updateActivityMutation.isPending ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            {selectedActivity ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View activity dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>{t('volunteers.viewActivity')}</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('volunteers.volunteer')}
                value={`${selectedActivity.volunteer?.firstName || ''} ${
                  selectedActivity.volunteer?.lastName || ''
                }`}
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
                value={format(new Date(selectedActivity.createdAt), 'dd/MM/yyyy HH:mm', {
                  locale: he,
                })}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>{t('common.close')}</Button>
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
