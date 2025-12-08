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
  Edit as EditIcon,
  Inventory as InventoryIcon,
  QrCode as QrCodeIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useProducts, useProductInstances } from '../hooks';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // שימוש בהוכים החדשים
  const { data: productsData, isLoading, error } = useProducts({ 
    page,
    limit: 10
  });
  
  const { data: productInstances } = useProductInstances();

  // Debug logging
  console.log('📦 Products Page Debug:', {
    productsData,
    productInstances,
    isLoading,
    error,
    search,
    categoryFilter,
    page
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryFilterChange = (event: any) => {
    setCategoryFilter(event.target.value);
    setPage(1);
  };

  const getStatusColor = (availableCount: number, totalCount: number) => {
    if (availableCount === 0) return 'error';
    if (availableCount <= totalCount * 0.2) return 'warning';
    return 'success';
  };

  const getStatusText = (availableCount: number, totalCount: number) => {
    if (availableCount === 0) return 'אזל מהמלאי';
    if (availableCount <= totalCount * 0.2) return 'מלאי נמוך';
    return 'זמין';
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {t('products.loadError')} {error.message}
        </Alert>
      </Box>
    );
  }

  const products = (productsData as any)?.products || [];
  const productInstancesMap = new Map();
  
  // יצירת מפה של מופעי מוצרים לפי מוצר
  productInstances?.forEach(instance => {
    if (!productInstancesMap.has(instance.productId)) {
      productInstancesMap.set(instance.productId, { total: 0, available: 0 });
    }
    const counts = productInstancesMap.get(instance.productId);
    counts.total += 1;
    if (instance.isAvailable) counts.available += 1;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t('products.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          {t('products.addProduct')}
        </Button>
      </Box>

      {/* Debug Panel */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t('products.debug', { 
            loading: isLoading, 
            error: error ? (error as any).message || t('common.error') : t('common.no'), 
            count: products.length, 
            instances: productInstances?.length || 0 
          })}
        </Typography>
      </Alert>

      {/* סטטיסטיקות מהירות */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <InventoryIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {(productsData as any)?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('products.stats.totalProducts')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <QrCodeIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {productInstances?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('products.stats.productInstances')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <VisibilityIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {productInstances?.filter(i => i.isAvailable).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('products.available')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <InventoryIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {productInstances?.filter(i => !i.isAvailable).length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('products.borrowed')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* חיפוש וסינון */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="חיפוש מוצרים..."
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
          <InputLabel>{t('products.filter.category')}</InputLabel>
          <Select
            value={categoryFilter}
            label="קטגוריה"
            onChange={handleCategoryFilterChange}
          >
            <MenuItem value="all">{t('products.categories.all')}</MenuItem>
            <MenuItem value="ניידות">{t('products.categories.mobility')}</MenuItem>
            <MenuItem value="ריהוט רפואי">{t('products.categories.medical_furniture')}</MenuItem>
            <MenuItem value="עזרי שמיעה">{t('products.categories.hearing_aids')}</MenuItem>
            <MenuItem value="עזרי ראייה">{t('products.categories.vision_aids')}</MenuItem>
            <MenuItem value="עזרי רחצה">{t('products.categories.bathing_aids')}</MenuItem>
            <MenuItem value="אחר">{t('products.categories.other')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* טבלת מוצרים / כרטיסיות למובייל */}
      {isMobile ? (
        // תצוגת כרטיסיות למובייל
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>{t('products.noProducts')}</Typography>
            </Paper>
          ) : (
            products.map((product: any) => {
              const instanceCounts = productInstancesMap.get(product.id) || { total: 0, available: 0 };
              return (
                <Card key={product.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {product.name}
                      </Typography>
                      <Chip
                        label={getStatusText(instanceCounts.available, instanceCounts.total)}
                        color={getStatusColor(instanceCounts.available, instanceCounts.total)}
                        size="small"
                      />
                    </Box>
                    
                    {product.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.description}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('products.category')}:</strong>{' '}
                      <Chip 
                        label={product.category}
                        size="small"
                        variant="outlined"
                      />
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>{t('products.manufacturer')}:</strong> {product.manufacturer}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>{t('products.instances')}:</strong> {instanceCounts.total}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('products.availability')}:</strong> {instanceCounts.available}/{instanceCounts.total}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton size="small" title="צפה">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" title="ערוך">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" title="מופעים">
                      <QrCodeIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              );
            })
          )}
        </Box>
      ) : (
        // תצוגת טבלה לדסקטופ
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('products.productName')}</TableCell>
                <TableCell>{t('products.category')}</TableCell>
                <TableCell>{t('products.manufacturer')}</TableCell>
                <TableCell align="center">{t('products.instances')}</TableCell>
                <TableCell align="center">{t('products.availability')}</TableCell>
                <TableCell align="center">{t('common.status')}</TableCell>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {t('products.noProducts')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: any) => {
                  const instanceCounts = productInstancesMap.get(product.id) || { total: 0, available: 0 };
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {product.name}
                        </Typography>
                        {product.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {product.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{product.manufacturer}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {instanceCounts.total}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {instanceCounts.available}/{instanceCounts.total}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusText(instanceCounts.available, instanceCounts.total)}
                          color={getStatusColor(instanceCounts.available, instanceCounts.total)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" title="צפה">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" title="ערוך">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" title="מופעים">
                          <QrCodeIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* דף */}
      {productsData?.pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('products.pagination', { 
              page: productsData.pagination.page, 
              totalPages: Math.ceil(productsData.pagination.total / productsData.pagination.limit),
              total: productsData.pagination.total 
            })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductsPage;