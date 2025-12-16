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
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import SearchAndFilter, { FilterOption, ActiveFilter } from '../components/SearchAndFilter';
import StatsGrid from '../components/StatsGrid';
import { useInfiniteAuditLogs, useAuditStats } from '../hooks';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { COLORS } from '../theme/colors';

const AuditPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Define available filters
  const availableFilters: FilterOption[] = [
    {
      id: 'action',
      label: t('audit.filter.actionType'),
      type: 'select',
      options: [
        { value: 'LOGIN', label: t('audit.actions.login') },
        { value: 'CREATE', label: t('audit.actions.create') },
        { value: 'UPDATE', label: t('audit.actions.update') },
        { value: 'DELETE', label: t('audit.actions.delete') },
        { value: 'PERMISSIONS', label: t('audit.actions.permissions') },
      ],
    },
    {
      id: 'entityType',
      label: t('audit.filter.entityType'),
      type: 'select',
      options: [
        { value: 'User', label: t('audit.entities.user') },
        { value: 'Product', label: t('audit.entities.product') },
        { value: 'Loan', label: t('audit.entities.loan') },
        { value: 'VolunteerActivity', label: t('audit.entities.volunteer') },
        { value: 'Permission', label: t('audit.entities.permission') },
      ],
    },
    {
      id: 'date',
      label: t('audit.filter.date'),
      type: 'date',
    },
    {
      id: 'ipAddress',
      label: t('audit.filter.ipAddress'),
      type: 'text',
      placeholder: t('audit.filter.ipPlaceholder'),
    },
  ];

  // Function to export data
  const handleExportData = () => {
    try {
      // Create CSV of current data
      const csvData = filteredLogs.map((log: any) => ({
        זמן: format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', {
          locale: he,
        }),
        משתמש: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'משתמש לא ידוע',
        פעולה: getActionText(log.action),
        ישות: log.entityType || 'לא זמין',
        תיאור: log.description || 'אין תיאור',
        'כתובת IP': log.ipAddress || 'N/A',
      }));

      // Convert JSON to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any) =>
          headers.map(header => `"${(row as any)[header] || ''}"`).join(',')
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('שגיאה בייצוא הנתונים:', error);
      alert('שגיאה בייצוא הנתונים');
    }
  };

  // Function to view log details
  const handleViewDetails = (logId: string) => {
    setSelectedLogId(logId);
    setViewDialogOpen(true);
  };

  // Function to close view dialog
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedLogId(null);
  };

  // Using new hooks
  const {
    data: infiniteData,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAuditLogs();

  // Get exact statistics from server
  const { data: statsData, isLoading: statsLoading } = useAuditStats();

  // Debug: Let's see what we're getting
  console.log('infiniteData:', infiniteData);

  // Get general statistics from first page
  const totalCount = (infiniteData?.pages[0] as any)?.total || 0;

  // Merge all pages into one list
  const auditLogs = infiniteData?.pages?.flatMap((page: any) => page?.data || []) || [];

  // Functions for filter management
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
  };

  const handleFilterRemove = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const handleClearAll = () => {
    setSearch('');
    setActiveFilters([]);
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
      case 'user_login':
        return 'התחברות משתמש';
      case 'user_logout':
        return 'התנתקות משתמש';
      case 'user_create':
        return 'יצירת משתמש';
      case 'user_update':
        return 'עדכון משתמש';
      case 'user_delete':
        return 'מחיקת משתמש';
      case 'product_create':
        return 'יצירת מוצר';
      case 'product_update':
        return 'עדכון מוצר';
      case 'product_delete':
        return 'מחיקת מוצר';
      case 'loan_create':
        return 'יצירת השאלה';
      case 'loan_update':
        return 'עדכון השאלה';
      case 'loan_return':
        return 'החזרת השאלה';
      case 'permission_grant':
        return 'הענקת הרשאה';
      case 'permission_revoke':
        return 'שלילת הרשאה';
      default:
        return action;
    }
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'user':
        return <PersonIcon fontSize="small" />;
      case 'product':
        return <AssessmentIcon fontSize="small" />;
      case 'loan':
        return <TimelineIcon fontSize="small" />;
      default:
        return <SecurityIcon fontSize="small" />;
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

  // Data is already defined above

  // Filter logs by search and filters
  const filteredLogs = auditLogs.filter((log: any) => {
    // Filter by search
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(searchLower) ||
      log.description.toLowerCase().includes(searchLower) ||
      log.entityType.toLowerCase().includes(searchLower) ||
      log.user?.firstName?.toLowerCase().includes(searchLower) ||
      log.user?.lastName?.toLowerCase().includes(searchLower) ||
      log.user?.email?.toLowerCase().includes(searchLower);

    // Apply all active filters
    const matchesFilters = activeFilters.every(filter => {
      if (filter.id === 'action') {
        switch (filter.value) {
          case 'LOGIN':
            return (
              log.action.toLowerCase().includes('login') ||
              log.action.toLowerCase().includes('logout')
            );
          case 'CREATE':
            return (
              log.action.toLowerCase().includes('create') ||
              log.action.toLowerCase().includes('register')
            );
          case 'UPDATE':
            return (
              log.action.toLowerCase().includes('update') ||
              log.action.toLowerCase().includes('edit')
            );
          case 'DELETE':
            return (
              log.action.toLowerCase().includes('delete') ||
              log.action.toLowerCase().includes('remove')
            );
          case 'PERMISSIONS':
            return (
              log.action.toLowerCase().includes('permission') ||
              log.action.toLowerCase().includes('grant') ||
              log.action.toLowerCase().includes('revoke')
            );
          default:
            return true;
        }
      } else if (filter.id === 'entityType') {
        return log.entityType === filter.value;
      } else if (filter.id === 'date') {
        const filterDate = new Date(filter.value);
        const logDate = new Date(log.timestamp);
        return logDate.toDateString() === filterDate.toDateString();
      } else if (filter.id === 'ipAddress') {
        return log.ipAddress?.toLowerCase().includes(filter.value.toLowerCase());
      }
      return true;
    });

    return matchesSearch && matchesFilters;
  });

  // Calculate statistics - from server and local data
  const actionsCount = new Map();
  const usersCount = new Set();

  // Local calculation for filtered data
  filteredLogs.forEach((log: any) => {
    actionsCount.set(log.action, (actionsCount.get(log.action) || 0) + 1);
    if (log.user?.id) usersCount.add(log.user.id);
  });

  // Use server statistics for total data
  const totalActionsFromServer = statsData?.totalLogs || totalCount;
  const todayActionsCount = auditLogs.filter((log: any) => {
    const logDate = new Date(log.createdAt);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  }).length;
  const uniqueUsersFromServer = statsData
    ? Object.keys(statsData.logsByUser || {}).length
    : usersCount.size;
  const uniqueActionsFromServer = statsData
    ? Object.keys(statsData.logsByAction || {}).length
    : actionsCount.size;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t('audit.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton title="רענן נתונים" onClick={() => refetch()}>
            <RefreshIcon />
          </IconButton>
          <IconButton title="ייצוא נתונים" onClick={handleExportData}>
            <GetAppIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Quick statistics */}
      <StatsGrid
        stats={[
          {
            icon: <SecurityIcon />,
            value: totalActionsFromServer,
            label: t('audit.stats.totalActions'),
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            loading: statsLoading,
          },
          {
            icon: <TimelineIcon />,
            value: todayActionsCount,
            label: t('audit.stats.todayActions'),
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            loading: statsLoading,
          },
          {
            icon: <PersonIcon />,
            value: uniqueUsersFromServer,
            label: t('audit.stats.activeUsers'),
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            loading: statsLoading,
          },
          {
            icon: <AssessmentIcon />,
            value: uniqueActionsFromServer,
            label: t('audit.stats.actionTypes'),
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            loading: statsLoading,
          },
        ]}
      />

      {/* Search and filter component */}
      <SearchAndFilter
        searchValue={search}
        onSearchChange={value => setSearch(value)}
        searchPlaceholder={t('audit.searchPlaceholder')}
        availableFilters={availableFilters}
        activeFilters={activeFilters}
        onFilterAdd={handleFilterAdd}
        onFilterRemove={handleFilterRemove}
        onClearAll={handleClearAll}
        disabled={isLoading}
      />

      {/* Audit log table / mobile cards */}
      {isMobile ? (
        // Mobile cards view
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredLogs.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>{t('audit.noAuditRecords')}</Typography>
            </Paper>
          ) : (
            filteredLogs.map((log: any) => (
              <Card key={log.id}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
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
                    <strong>{t('audit.time')}:</strong>{' '}
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', {
                      locale: he,
                    })}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
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
                  <IconButton
                    size="small"
                    title="צפה בפרטים"
                    onClick={() => handleViewDetails(log.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))
          )}

          {/* Load more button for mobile */}
          {hasNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outlined"
                startIcon={isFetchingNextPage ? <CircularProgress size={20} /> : null}
              >
                {isFetchingNextPage ? 'טוען...' : 'טען עוד פעולות'}
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        // Desktop table view
        <>
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
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {t('audit.noAuditRecords')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log: any) => (
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
                        <IconButton
                          size="small"
                          title="צפה בפרטים"
                          onClick={() => handleViewDetails(log.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Load more button */}
          {hasNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outlined"
                startIcon={isFetchingNextPage ? <CircularProgress size={20} /> : null}
              >
                {isFetchingNextPage ? 'טוען...' : 'טען עוד פעולות'}
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Information about loaded data */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {t('audit.loadedEntries', {
            loaded: auditLogs.length,
            total: totalCount,
          })}
        </Typography>
      </Box>

      {/* View details dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">{t('audit.viewDetails.title')}</Typography>
        </DialogTitle>
        <DialogContent>
          {selectedLogId &&
            (() => {
              const selectedLog = auditLogs.find((log: any) => log.id === selectedLogId);
              if (!selectedLog) return <Typography>{t('audit.viewDetails.notFound')}</Typography>;

              return (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('audit.viewDetails.time')}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss', {
                          locale: he,
                        })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('audit.viewDetails.user')}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedLog.user
                          ? `${selectedLog.user.firstName} ${selectedLog.user.lastName} (${selectedLog.user.email})`
                          : t('audit.viewDetails.unknownUser')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('audit.viewDetails.actionType')}
                      </Typography>
                      <Chip
                        label={getActionText(selectedLog.action)}
                        color={getActionColor(selectedLog.action)}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('audit.viewDetails.entity')}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {selectedLog.entityType || t('audit.viewDetails.notAvailable')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('audit.viewDetails.entityId')}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace' }}>
                        {selectedLog.entityId || t('audit.viewDetails.notAvailable')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('audit.viewDetails.ipAddress')}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2, fontFamily: 'monospace' }}>
                        {selectedLog.ipAddress || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {t('audit.viewDetails.description')}
                      </Typography>
                      <Paper sx={{ p: 2, backgroundColor: COLORS.grey[50], mt: 1 }}>
                        <Typography variant="body2">
                          {selectedLog.description || t('audit.viewDetails.noDescription')}
                        </Typography>
                      </Paper>
                    </Grid>
                    {selectedLog.metadata && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t('audit.viewDetails.metadata')}
                        </Typography>
                        <Paper sx={{ p: 2, backgroundColor: COLORS.grey[50], mt: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                            }}
                          >
                            {typeof selectedLog.metadata === 'string'
                              ? selectedLog.metadata
                              : JSON.stringify(selectedLog.metadata, null, 2)}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              );
            })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog} color="primary">
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditPage;
