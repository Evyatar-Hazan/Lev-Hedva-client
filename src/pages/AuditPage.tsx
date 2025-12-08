import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useAuditLogs } from '../hooks';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const AuditPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // שימוש בהוכים החדשים
  const { data: auditData, isLoading, error } = useAuditLogs({ 
    page,
    limit: 10
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleActionFilterChange = (event: any) => {
    setActionFilter(event.target.value);
    setPage(1);
  };

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'info';
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'success';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'warning';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'error';
    return 'default';
  };

  const getActionText = (action: string) => {
    switch (action.toLowerCase()) {
      case 'user_login': return 'התחברות משתמש';
      case 'user_logout': return 'התנתקות משתמש';
      case 'user_create': return 'יצירת משתמש';
      case 'user_update': return 'עדכון משתמש';
      case 'user_delete': return 'מחיקת משתמש';
      case 'product_create': return 'יצירת מוצר';
      case 'product_update': return 'עדכון מוצר';
      case 'product_delete': return 'מחיקת מוצר';
      case 'loan_create': return 'יצירת השאלה';
      case 'loan_update': return 'עדכון השאלה';
      case 'loan_return': return 'החזרת השאלה';
      case 'permission_grant': return 'הענקת הרשאה';
      case 'permission_revoke': return 'שלילת הרשאה';
      default: return action;
    }
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'user': return <PersonIcon fontSize="small" />;
      case 'product': return <AssessmentIcon fontSize="small" />;
      case 'loan': return <TimelineIcon fontSize="small" />;
      default: return <SecurityIcon fontSize="small" />;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('audit.loadError')} {error.message}
        </Alert>
      </Box>
    );
  }

  const auditLogs = auditData?.data || [];

  // חישוב סטטיסטיקות
  const actionsCount = new Map();
  const usersCount = new Set();
  const entitiesToday = auditLogs.filter(log => {
    const logDate = new Date(log.createdAt);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  auditLogs.forEach(log => {
    actionsCount.set(log.action, (actionsCount.get(log.action) || 0) + 1);
    if (log.user?.id) usersCount.add(log.user.id);
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t('audit.title')}
        </Typography>
        <IconButton title="ייצוא נתונים">
          <GetAppIcon />
        </IconButton>
      </Box>

      {/* סטטיסטיקות מהירות */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {auditData?.pagination?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('audit.stats.totalActions')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {entitiesToday.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('audit.stats.todayActions')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {usersCount.size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('audit.stats.activeUsers')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {actionsCount.size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('audit.stats.actionTypes')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* חיפוש וסינון */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="חיפוש ביומן הביקורת..."
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
          <InputLabel>{t('audit.filter.actionType')}</InputLabel>
          <Select
            value={actionFilter}
            label="סוג פעולה"
            onChange={handleActionFilterChange}
          >
            <MenuItem value="all">{t('audit.actions.all')}</MenuItem>
            <MenuItem value="login">{t('audit.actions.login')}</MenuItem>
            <MenuItem value="create">{t('audit.actions.create')}</MenuItem>
            <MenuItem value="update">{t('audit.actions.update')}</MenuItem>
            <MenuItem value="delete">{t('audit.actions.delete')}</MenuItem>
            <MenuItem value="permission">{t('audit.actions.permissions')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* טבלת יומן ביקורת / כרטיסיות למובייל */}
      {isMobile ? (
        // תצוגת כרטיסיות למובייל
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : auditLogs.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>{t('audit.noAuditRecords')}</Typography>
            </Paper>
          ) : (
            auditLogs.map((log: any) => (
              <Card key={log.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="h6" component="div">
                          {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'מערכת'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.user?.email || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={getActionText(log.action)}
                      color={getActionColor(log.action)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('audit.time')}:</strong> {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: he })}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('audit.entity')}:</strong>
                    </Typography>
                    {getEntityTypeIcon(log.entityType)}
                    <Typography variant="body2">
                      {log.entityType}
                      {log.entityId && ` #${log.entityId.substring(0, 8)}`}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('audit.description')}:</strong> {log.description || 'אין תיאור'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('audit.ipAddress')}:</strong> {log.ipAddress || 'N/A'}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton size="small" title="צפה בפרטים">
                    <VisibilityIcon />
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
                <TableCell>{t('audit.time')}</TableCell>
                <TableCell>{t('audit.user')}</TableCell>
                <TableCell>{t('audit.action')}</TableCell>
                <TableCell>{t('audit.entity')}</TableCell>
                <TableCell>{t('audit.description')}</TableCell>
                <TableCell>{t('audit.ipAddress')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {t('audit.noAuditRecords')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.8rem">
                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: he })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'מערכת'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.user?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getActionText(log.action)}
                        color={getActionColor(log.action)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEntityTypeIcon(log.entityType)}
                        <Typography variant="body2">
                          {log.entityType}
                          {log.entityId && ` #${log.entityId.substring(0, 8)}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300 }}>
                        {log.description || 'אין תיאור'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {log.ipAddress || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" title="צפה בפרטים">
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* דף */}
      {auditData?.pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('audit.pagination', { 
              page: auditData.pagination.page, 
              totalPages: Math.ceil(auditData.pagination.total / auditData.pagination.limit),
              total: auditData.pagination.total 
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AuditPage;