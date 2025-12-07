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
  Grid,
  Card,
  CardContent,
  Avatar,
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
} from '@mui/icons-material';
import { useVolunteerActivities } from '../hooks';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const VolunteersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // שימוש בהוכים החדשים
  const { data: activitiesData, isLoading, error } = useVolunteerActivities({ 
    page,
    limit: 10
  });

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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          שגיאה בטעינת נתוני המתנדבים: {error.message}
        </Alert>
      </Box>
    );
  }

  const activities = activitiesData?.data || [];

  // קבלת סטטיסטיקות מתנדבים
  const volunteerStats = new Map();
  activities.forEach(activity => {
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
          ניהול מתנדבים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          הוספת פעילות
        </Button>
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
                מתנדבים פעילים
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
                פעילויות השנה
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
                שעות התנדבות
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
                מתנדבי זהב
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
          <InputLabel>סוג פעילות</InputLabel>
          <Select
            value={statusFilter}
            label="סוג פעילות"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="all">כל הפעילויות</MenuItem>
            <MenuItem value="delivery">משלוח</MenuItem>
            <MenuItem value="home_visit">ביקור בית</MenuItem>
            <MenuItem value="phone_call">שיחה טלפונית</MenuItem>
            <MenuItem value="maintenance">תחזוקה</MenuItem>
            <MenuItem value="other">אחר</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* טבלת פעילויות מתנדבים */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>מתנדב</TableCell>
              <TableCell>סוג פעילות</TableCell>
              <TableCell>תיאור</TableCell>
              <TableCell>תאריך</TableCell>
              <TableCell align="center">שעות</TableCell>
              <TableCell align="center">פעולות</TableCell>
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
                    לא נמצאו פעילויות התנדבות
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity: any) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
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
                    <IconButton size="small" title="צפה">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" title="ערוך">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* דף */}
      {activitiesData?.pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            עמוד {activitiesData.pagination.page} מתוך {Math.ceil(activitiesData.pagination.total / activitiesData.pagination.limit)} |
            סה"כ {activitiesData.pagination.total} פעילויות
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VolunteersPage;