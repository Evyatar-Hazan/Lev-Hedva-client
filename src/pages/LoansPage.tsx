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
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Undo as UndoIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import SearchAndFilter, { FilterOption, ActiveFilter } from '../components/SearchAndFilter';
import StatsGrid from '../components/StatsGrid';
import { useLoans, useLoanStats, useReturnLoan, useCreateLoan, useUpdateLoan } from '../hooks';
import { useUsers } from '../hooks/useUsers';
import { useProductInstances } from '../hooks/useProducts';
import { format } from 'date-fns';

const LoansPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editLoanId, setEditLoanId] = useState<string | null>(null);
  const [newLoan, setNewLoan] = useState({
    userId: '',
    productInstanceId: '',
    expectedReturnDate: '',
    notes: ''
  });
  const [editLoan, setEditLoan] = useState({
    expectedReturnDate: '',
    notes: '',
    status: ''
  });

  // שימוש בהוכים החדשים
  const { data: loansData, isLoading, error } = useLoans({ 
    page,
    limit: 10
  });
  
  const { data: loanStats } = useLoanStats();
  const returnLoanMutation = useReturnLoan();
  const createLoanMutation = useCreateLoan();
  const updateLoanMutation = useUpdateLoan();
  const { data: usersData } = useUsers();
  const { data: productInstancesData } = useProductInstances();

  // חילוץ קטגוריות ייחודיות מהמוצרים
  const uniqueCategories = React.useMemo(() => {
    if (!productInstancesData) return [];
    const categories = new Set<string>();
    productInstancesData.forEach((instance: any) => {
      if (instance.product?.category) {
        categories.add(instance.product.category);
      }
    });
    return Array.from(categories).sort();
  }, [productInstancesData]);

  // הגדרת הפילטרים הזמינים (אחרי קריאת ה-hooks)
  const availableFilters: FilterOption[] = [
    {
      id: 'status',
      label: t('loans.filter.status'),
      type: 'select',
      options: [
        { value: 'active', label: t('loans.status.active') },
        { value: 'overdue', label: t('loans.status.overdue') },
        { value: 'returned', label: t('loans.status.returned') },
        { value: 'lost', label: t('loans.status.lost') },
      ],
    },
    {
      id: 'user',
      label: t('loans.filter.borrower'),
      type: 'autocomplete',
      autocompleteOptions: usersData?.users || [],
      getOptionLabel: (option: any) => `${option.firstName} ${option.lastName} (${option.email})`,
    },
    {
      id: 'category',
      label: t('loans.filter.category'),
      type: 'select',
      options: uniqueCategories.map(cat => ({ value: cat, label: cat })),
    },
    {
      id: 'loanDate',
      label: t('loans.filter.loanDate'),
      type: 'date',
    },
    {
      id: 'returnDate',
      label: t('loans.filter.expectedReturn'),
      type: 'date',
    },
  ];

  // פונקציות לניהול פילטרים
  const handleFilterAdd = (filterId: string, value: any) => {
    const filterDef = availableFilters.find(f => f.id === filterId);
    if (!filterDef) return;

    let displayValue = value;
    if (filterDef.type === 'select' && filterDef.options) {
      const option = filterDef.options.find(o => o.value === value);
      displayValue = option?.label || value;
    } else if (filterDef.type === 'autocomplete' && filterDef.getOptionLabel) {
      // עבור autocomplete, השתמש ב-getOptionLabel להצגת הערך
      displayValue = filterDef.getOptionLabel(value);
    } else if (filterDef.type === 'date') {
      // עבור תאריך, הצג בפורמט קריא
      displayValue = new Date(value).toLocaleDateString('he-IL');
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

  // סינון השאלות לפי סטטוס ופילטרים נוספים
  const getFilteredLoans = () => {
    if (!loansData?.loans) return [];
    
    let filtered = loansData.loans;

    // יישום כל הפילטרים הפעילים
    activeFilters.forEach(filter => {
      if (filter.id === 'status') {
        filtered = filtered.filter(loan => {
          const today = new Date();
          const expectedReturn = loan.expectedReturnDate ? new Date(loan.expectedReturnDate) : null;
          const isOverdue = loan.status === 'ACTIVE' && expectedReturn && expectedReturn < today;
          
          switch (filter.value) {
            case 'active':
              return loan.status?.toLowerCase() === 'active' && !isOverdue;
            case 'overdue':
              return loan.status?.toLowerCase() === 'overdue' || isOverdue;
            case 'returned':
              return loan.status?.toLowerCase() === 'returned';
            case 'lost':
              return loan.status?.toLowerCase() === 'lost';
            default:
              return true;
          }
        });
      } else if (filter.id === 'user') {
        filtered = filtered.filter(loan => loan.userId === filter.value.id);
      } else if (filter.id === 'category') {
        filtered = filtered.filter(loan => loan.productInstance?.product?.category === filter.value);
      } else if (filter.id === 'loanDate') {
        const filterDate = new Date(filter.value);
        filtered = filtered.filter(loan => {
          const loanDate = new Date(loan.createdAt);
          return loanDate.toDateString() === filterDate.toDateString();
        });
      } else if (filter.id === 'returnDate') {
        const filterDate = new Date(filter.value);
        filtered = filtered.filter(loan => {
          if (!loan.expectedReturnDate) return false;
          const returnDate = new Date(loan.expectedReturnDate);
          return returnDate.toDateString() === filterDate.toDateString();
        });
      }
    });

    // סינון לפי חיפוש
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(loan => {
        const userName = `${loan.user?.firstName || ''} ${loan.user?.lastName || ''}`.toLowerCase();
        const productName = loan.productInstance?.product?.name?.toLowerCase() || '';
        return userName.includes(searchLower) || productName.includes(searchLower);
      });
    }
    
    return filtered;
  };

  const filteredLoans = getFilteredLoans();

  const handleReturnLoan = async (loanId: string) => {
    try {
      await returnLoanMutation.mutateAsync(loanId);
    } catch (error) {
      console.error('Failed to return loan:', error);
    }
  };

  const handleCreateLoan = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditLoan = (loanId: string) => {
    const loanToEdit = loansData?.loans?.find(loan => loan.id === loanId);
    if (loanToEdit) {
      setEditLoanId(loanId);
      setEditLoan({
        expectedReturnDate: loanToEdit.expectedReturnDate 
          ? new Date(loanToEdit.expectedReturnDate).toISOString().split('T')[0] 
          : '',
        notes: loanToEdit.notes || '',
        status: loanToEdit.status || ''
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditLoanId(null);
    setEditLoan({
      expectedReturnDate: '',
      notes: '',
      status: ''
    });
  };

  const handleSubmitEditLoan = async () => {
    if (!editLoanId) return;
    
    try {
      // המרת תאריך לפורמט ISO עם שעה
      const loanData = {
        ...editLoan,
        expectedReturnDate: editLoan.expectedReturnDate 
          ? new Date(editLoan.expectedReturnDate + 'T23:59:59.999Z').toISOString()
          : undefined
      };
      
      await updateLoanMutation.mutateAsync({
        id: editLoanId,
        loanData
      });
      handleCloseEditDialog();
    } catch (error) {
      console.error('Failed to update loan:', error);
    }
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewLoan({
      userId: '',
      productInstanceId: '',
      expectedReturnDate: '',
      notes: ''
    });
  };

  const handleSubmitCreateLoan = async () => {
    try {
      // המרת תאריך לפורמט ISO עם שעה
      const loanData = {
        ...newLoan,
        expectedReturnDate: newLoan.expectedReturnDate 
          ? new Date(newLoan.expectedReturnDate + 'T23:59:59.999Z').toISOString()
          : undefined
      };
      
      await createLoanMutation.mutateAsync(loanData);
      handleCloseCreateDialog();
    } catch (error) {
      console.error('Failed to create loan:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'info';
      case 'overdue': return 'error';
      case 'returned': return 'success';
      default: return 'default';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return t('loans.status.active');
      case 'overdue': return t('loans.status.overdue');
      case 'returned': return t('loans.status.returned');
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
          onClick={handleCreateLoan}
        >
          {t('loans.newLoan')}
        </Button>
      </Box>

      {/* סטטיסטיקות מהירות */}
      <StatsGrid stats={[
        {
          icon: <AssignmentIcon />,
          value: loanStats?.totalActiveLoans || 0,
          label: t('loans.stats.activeLoans'),
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          icon: <UndoIcon />,
          value: loanStats?.totalOverdueLoans || 0,
          label: t('loans.stats.overdue'),
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
          icon: <PersonIcon />,
          value: loanStats?.totalReturnedLoans || 0,
          label: t('loans.stats.returned'),
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
          icon: <AssignmentIcon />,
          value: loanStats?.totalLostItems || 0,
          label: t('loans.stats.lost'),
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        },
      ]} />

      {/* קומפוננטת חיפוש ופילטר */}
      <SearchAndFilter
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={t('loans.searchPlaceholder')}
        availableFilters={availableFilters}
        activeFilters={activeFilters}
        onFilterAdd={handleFilterAdd}
        onFilterRemove={handleFilterRemove}
        onClearAll={handleClearAll}
        disabled={isLoading}
      />

      {/* טבלת השאלות / כרטיסיות למובייל */}
      {isMobile ? (
        // תצוגת כרטיסיות למובייל
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredLoans?.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>{t('loans.noLoans')}</Typography>
            </Paper>
          ) : (
            filteredLoans?.map((loan) => (
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
                  {(loan.status === 'ACTIVE' || loan.status === 'OVERDUE') && (
                    <IconButton 
                      size="small" 
                      color="primary" 
                      title={t('loans.actions.return')}
                      onClick={() => handleReturnLoan(loan.id)}
                      disabled={returnLoanMutation.isPending}
                    >
                      <UndoIcon />
                    </IconButton>
                  )}
                  <IconButton 
                    size="small" 
                    color="primary" 
                    title={t('loans.actions.edit')}
                    onClick={() => handleEditLoan(loan.id)}
                  >
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
              ) : filteredLoans?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    {t('loans.noLoans')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans?.map((loan) => (
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
                      {(loan.status === 'ACTIVE' || loan.status === 'OVERDUE') && (
                        <IconButton 
                          size="small" 
                          color="primary" 
                          title={t('loans.actions.return')}
                          onClick={() => handleReturnLoan(loan.id)}
                          disabled={returnLoanMutation.isPending}
                        >
                          <UndoIcon />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        color="primary" 
                        title={t('loans.actions.edit')}
                        onClick={() => handleEditLoan(loan.id)}
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
      {loansData && loansData.total > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2">
            {t('loans.pagination', { 
              showing: loansData.loans.length, 
              total: loansData.total 
            })}
          </Typography>
        </Box>
      )}

      {/* דיאלוג יצירת הלוואה חדשה */}
      <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('loans.createNewLoan')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={usersData?.users || []}
              getOptionLabel={(option: any) => `${option.firstName} ${option.lastName} (${option.email})`}
              value={usersData?.users?.find((u: any) => u.id === newLoan.userId) || null}
              onChange={(_, newValue: any) => {
                setNewLoan(prev => ({ ...prev, userId: newValue?.id || '' }));
              }}
              renderInput={(params) => (
                <TextField {...params} label={t('loans.selectUser')} required />
              )}
            />

            <Autocomplete
              options={productInstancesData || []}
              getOptionLabel={(option: any) => 
                `${option.product.name} - ${option.barcode} (${option.condition})`
              }
              value={productInstancesData?.find((p: any) => p.id === newLoan.productInstanceId) || null}
              onChange={(_, newValue: any) => {
                setNewLoan(prev => ({ ...prev, productInstanceId: newValue?.id || '' }));
              }}
              isOptionEqualToValue={(option: any, value: any) => option.id === value?.id}
              getOptionDisabled={(option: any) => !option.isAvailable}
              renderInput={(params) => (
                <TextField {...params} label={t('loans.selectProduct')} required />
              )}
            />

            <TextField
              label={t('loans.expectedReturnDate')}
              type="date"
              value={newLoan.expectedReturnDate}
              onChange={(e) => setNewLoan(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().split('T')[0], // תאריך מינימלי - היום
              }}
            />

            <TextField
              label={t('loans.notes')}
              multiline
              rows={3}
              value={newLoan.notes}
              onChange={(e) => setNewLoan(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmitCreateLoan}
            variant="contained"
            disabled={!newLoan.userId || !newLoan.productInstanceId || createLoanMutation.isPending}
          >
            {createLoanMutation.isPending ? <CircularProgress size={20} /> : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג עריכת השאלה */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{t('loans.editLoan')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={t('loans.expectedReturnDate')}
              type="date"
              value={editLoan.expectedReturnDate}
              onChange={(e) => setEditLoan(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>{t('loans.status.label')}</InputLabel>
              <Select
                value={editLoan.status}
                onChange={(e) => setEditLoan(prev => ({ ...prev, status: e.target.value }))}
                label={t('loans.status.label')}
              >
                <MenuItem value="ACTIVE">{t('loans.status.active')}</MenuItem>
                <MenuItem value="OVERDUE">{t('loans.status.overdue')}</MenuItem>
                <MenuItem value="RETURNED">{t('loans.status.returned')}</MenuItem>
                <MenuItem value="LOST">{t('loans.status.lost')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('loans.notes')}
              multiline
              rows={3}
              value={editLoan.notes}
              onChange={(e) => setEditLoan(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('loans.notesPlaceholder')}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmitEditLoan}
            variant="contained"
            disabled={updateLoanMutation.isPending}
          >
            {updateLoanMutation.isPending ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoansPage;