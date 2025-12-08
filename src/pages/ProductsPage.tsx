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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  QrCode as QrCodeIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useProducts, useProductInstances, useCreateProduct } from '../hooks';
import { CreateProductDto } from '../lib/types';

// רכיב פשוט לתצוגת מופעים
const ProductInstancesView: React.FC<{ product: any; instances: any[] }> = ({ product, instances }) => {
  const { t } = useTranslation();
  
  if (!instances || instances.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('products.no_instances')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('products.add_first_instance')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {instances.map((instance) => (
          <Grid item xs={12} sm={6} md={4} key={instance.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {instance.barcode || `מופע ${instance.id.slice(-4)}`}
                </Typography>
                
                {instance.serialNumber && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>{t('products.serial_number')}:</strong> {instance.serialNumber}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>{t('products.condition')}:</strong> {instance.condition}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>{t('products.status')}:</strong>{' '}
                  <Chip
                    label={instance.isAvailable ? t('products.available') : t('products.borrowed')}
                    color={instance.isAvailable ? 'success' : 'warning'}
                    size="small"
                  />
                </Typography>
                
                {instance.location && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>{t('products.location')}:</strong> {instance.location}
                  </Typography>
                )}
                
                {instance.notes && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('products.notes')}:</strong> {instance.notes}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button size="small" startIcon={<EditIcon />}>
                  {t('common.edit')}
                </Button>
                <Button size="small" color="error" startIcon={<CloseIcon />}>
                  {t('common.delete')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  // משתנים לניהול תצוגה
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isViewingInstances, setIsViewingInstances] = useState(false);
  
  // דיאלוגי פעולות מוצרים
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<CreateProductDto>({
    name: '',
    description: '',
    category: '',
    manufacturer: '',
    model: '',
  });
  
  // שימוש בהוכים
  const { data: productsData, isLoading, error } = useProducts({ 
    page,
    limit: 10
  });
  
  const createProductMutation = useCreateProduct();
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

  const handleAddProduct = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewProduct({
      name: '',
      description: '',
      category: '',
      manufacturer: '',
      model: '',
    });
  };

  const handleSaveProduct = async () => {
    console.log('🔄 Starting product save process...');
    console.log('📋 Current product state:', newProduct);
    console.log('🚀 Mutation status:', { 
      isPending: createProductMutation.isPending, 
      isError: createProductMutation.isError,
      error: createProductMutation.error 
    });
    
    try {
      // ניקוי הדאטה - הסרת שדות ריקים
      const cleanedProduct: CreateProductDto = {
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        ...(newProduct.description?.trim() && { description: newProduct.description.trim() }),
        ...(newProduct.manufacturer?.trim() && { manufacturer: newProduct.manufacturer.trim() }),
        ...(newProduct.model?.trim() && { model: newProduct.model.trim() }),
      };
      
      console.log('📤 Sending product data:', cleanedProduct);
      
      const result = await createProductMutation.mutateAsync(cleanedProduct);
      console.log('✅ Product created successfully:', result);
      
      handleCloseAddDialog();
    } catch (error) {
      console.error('❌ Error creating product:', error);
      
      // הצגת פרטי השגיאה
      if (error && typeof error === 'object') {
        console.error('Error details:', {
          message: (error as any)?.message,
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
          request: (error as any)?.request
        });
      }
      
      // לא סוגרים את הדיאלוג במקרה של שגיאה
      // handleCloseAddDialog();
    }
  };

  const handleProductFieldChange = (field: keyof CreateProductDto, value: string) => {
    console.log('🔄 Product field change:', { field, value });
    setNewProduct(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📦 Updated product:', updated);
      return updated;
    });
  };

  // פונקציה לטיפול בלחיצה על מוצר - מציגה את המופעים שלו
  const handleProductClick = (product: any) => {
    console.log('🖱️ Product clicked:', product);
    setSelectedProduct(product);
    setIsViewingInstances(true);
  };

  // פונקציה לחזרה לתצוגת המוצרים
  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setIsViewingInstances(false);
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

  // אם נבחר מוצר, מציגים את המופעים שלו
  if (isViewingInstances && selectedProduct) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBackToProducts} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {t('products.instancesTitle')} - {selectedProduct.name}
          </Typography>
        </Box>
        
        {/* כאן נוסיף את תצוגת המופעים */}
        <ProductInstancesView 
          product={selectedProduct} 
          instances={productInstances?.filter(inst => inst.productId === selectedProduct.id) || []}
        />
      </Box>
    );
  }

  // התצוגה הרגילה של רשימת המוצרים

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
          onClick={handleAddProduct}
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
                <Card 
                  key={product.id}
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4, backgroundColor: 'action.hover' },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => handleProductClick(product)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
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
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>{t('products.total_instances')}:</strong> {instanceCounts.total}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="success.main">
                          <strong>{t('products.available')}:</strong> {instanceCounts.available}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {product.manufacturer && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>{t('products.manufacturer')}:</strong> {product.manufacturer}
                      </Typography>
                    )}
                  </CardContent>
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
                <TableCell align="center">{t('products.total_instances')}</TableCell>
                <TableCell align="center">{t('products.available_instances')}</TableCell>
                <TableCell align="center">{t('common.status')}</TableCell>
                <TableCell align="center">{t('products.view_instances')}</TableCell>
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
                    <TableRow 
                      key={product.id}
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      onClick={() => handleProductClick(product)}
                    >
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
                        <Typography variant="body2" fontWeight="bold">
                          {instanceCounts.total}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          color={instanceCounts.available > 0 ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {instanceCounts.available}
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
                        <IconButton 
                          size="small" 
                          title={t('products.view_instances')}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product);
                          }}
                        >
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

      {/* Add Product Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('products.addProduct')}
          <IconButton
            aria-label="close"
            onClick={handleCloseAddDialog}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('products.productName')}
                value={newProduct.name}
                onChange={(e) => handleProductFieldChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('products.description')}
                value={newProduct.description}
                onChange={(e) => handleProductFieldChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>{t('products.category')}</InputLabel>
                <Select
                  value={newProduct.category}
                  onChange={(e) => handleProductFieldChange('category', e.target.value)}
                  label={t('products.category')}
                >
                  <MenuItem value="ניידות">{t('products.categories.mobility')}</MenuItem>
                  <MenuItem value="ריהוט רפואי">{t('products.categories.medical_furniture')}</MenuItem>
                  <MenuItem value="עזרי שמיעה">{t('products.categories.hearing_aids')}</MenuItem>
                  <MenuItem value="עזרי ראייה">{t('products.categories.vision_aids')}</MenuItem>
                  <MenuItem value="עזרי רחצה">{t('products.categories.bathing_aids')}</MenuItem>
                  <MenuItem value="אחר">{t('products.categories.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('products.manufacturer')}
                value={newProduct.manufacturer}
                onChange={(e) => handleProductFieldChange('manufacturer', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('products.model')}
                value={newProduct.model}
                onChange={(e) => handleProductFieldChange('model', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveProduct}
            variant="contained"
            disabled={createProductMutation.isPending || !newProduct.name.trim() || !newProduct.category.trim()}
          >
            {createProductMutation.isPending ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;