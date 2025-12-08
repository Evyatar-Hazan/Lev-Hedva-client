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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  Undo as UndoIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useLoans, useLoanStats, useReturnLoan } from '../hooks';
import { format } from 'date-fns';

const LoansPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // שימוש בהוכים החדשים
  const { data: loansData, isLoading, error } = useLoans({ 
    page,
    limit: 10
  });
  
  const { data: loanStats } = useLoanStats();
  const returnLoanMutation = useReturnLoan();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleReturnLoan = async (loanId: string) => {
    try {
      await returnLoanMutation.mutateAsync(loanId);
    } catch (error) {
      console.error('Failed to return loan:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'info';
      case 'overdue': return 'error';
      case 'returned': return 'success';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return t('loans.status.active');
      case 'overdue': return t('loans.status.overdue');
      case 'returned': return t('loans.status.returned');
      case 'pending': return 'ממתין'; // Add to translations if needed
      default: return status;
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('loans.loadError')} {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t('loans.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          {t('loans.newLoan')}
        </Button>
      </Box>

      {/* סטטיסטיקות מהירות */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {loanStats?.active || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('loans.stats.activeLoans')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <UndoIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {loanStats?.overdue || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('loans.stats.overdue')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {loanStats?.returned || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('loans.stats.returned')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {loanStats?.lost || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('loans.stats.lost')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* סרגל חיפוש וסינון */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="חיפוש השאלות..."
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
          <InputLabel>{t('loans.filter.status')}</InputLabel>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label={t('loans.filter.status')}
          >
            <MenuItem value="all">{t('loans.filter.allStatuses')}</MenuItem>
            <MenuItem value="active">{t('loans.status.active')}</MenuItem>
            <MenuItem value="overdue">{t('loans.status.overdue')}</MenuItem>
            <MenuItem value="returned">{t('loans.status.returned')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* טבלת השאלות / כרטיסיות למובייל */}
      {isMobile ? (
        // תצוגת כרטיסיות למובייל
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : loansData?.data?.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>{t('loans.noLoans')}</Typography>
            </Paper>
          ) : (
            loansData?.data?.map((loan) => (
              <Card key={loan.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {loan.user?.firstName} {loan.user?.lastName}
                    </Typography>
                    <Chip 
                      label={getStatusText(loan.status)} 
                      color={getStatusColor(loan.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('loans.product')}:</strong> {loan.productInstance?.product?.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('loans.loanDate')}:</strong> {format(new Date(loan.loanDate), 'dd/MM/yyyy')}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('loans.returnDate')}:</strong>{' '}
                    {loan.expectedReturnDate ? format(new Date(loan.expectedReturnDate), 'dd/MM/yyyy') : '-'}
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  {loan.status === 'ACTIVE' && (
                    <IconButton 
                      size="small" 
                      color="primary" 
                      title="החזרה"
                      onClick={() => handleReturnLoan(loan.id)}
                      disabled={returnLoanMutation.isPending}
                    >
                      <UndoIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" color="primary" title="עריכה">
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
                <TableCell>{t('loans.borrower')}</TableCell>
                <TableCell>{t('loans.product')}</TableCell>
                <TableCell>{t('loans.loanDate')}</TableCell>
                <TableCell>{t('loans.returnDate')}</TableCell>
                <TableCell>{t('common.status')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : loansData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    {t('loans.noLoans')}
                  </TableCell>
                </TableRow>
              ) : (
                loansData?.data?.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      {loan.user?.firstName} {loan.user?.lastName}
                    </TableCell>
                    <TableCell>
                      {loan.productInstance?.product?.name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(loan.loanDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {loan.expectedReturnDate ? format(new Date(loan.expectedReturnDate), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(loan.status)} 
                        color={getStatusColor(loan.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {loan.status === 'ACTIVE' && (
                        <IconButton 
                          size="small" 
                          color="primary" 
                          title="החזרה"
                          onClick={() => handleReturnLoan(loan.id)}
                          disabled={returnLoanMutation.isPending}
                        >
                          <UndoIcon />
                        </IconButton>
                      )}
                      <IconButton size="small" color="primary" title="עריכה">
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
      {loansData?.pagination && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2">
            {t('loans.pagination', { 
              showing: loansData.data.length, 
              total: loansData.pagination.total 
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LoansPage;