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
} from '@mui/icons-material';
import { useProducts, useProductInstances, useCreateProduct, useUpdateProduct } from '../hooks';
import { CreateProductDto, UpdateProductDto } from '../lib/types';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<CreateProductDto>({
    name: '',
    description: '',
    category: '',
    manufacturer: '',
    model: '',
  });

  // דיאלוגי הפעולות
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInstancesDialogOpen, setIsInstancesDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<UpdateProductDto>({
    name: '',
    description: '',
    category: '',
    manufacturer: '',
    model: '',
  });
  
  // שימוש בהוכים החדשים
  const { data: productsData, isLoading, error } = useProducts({ 
    page,
    limit: 10
  });
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  
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

  const handleViewProduct = (product: any) => {
    console.log('👁️ View product:', product);
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    console.log('✏️ Edit product:', product);
    setSelectedProduct(product);
    setEditProduct({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      manufacturer: product.manufacturer || '',
      model: product.model || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleManageInstances = (product: any) => {
    console.log('📦 Manage instances for product:', product);
    setSelectedProduct(product);
    setIsInstancesDialogOpen(true);
  };

  // פונקציות סגירת דיאלוגים
  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
    setEditProduct({
      name: '',
      description: '',
      category: '',
      manufacturer: '',
      model: '',
    });
  };

  const handleCloseInstancesDialog = () => {
    setIsInstancesDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProductFieldChange = (field: keyof UpdateProductDto, value: string) => {
    setEditProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEditProduct = async () => {
    if (!selectedProduct?.id) return;
    
    console.log('💾 Starting product edit save process...');
    console.log('📋 Current edit product state:', editProduct);
    console.log('🎯 Selected product ID:', selectedProduct.id);
    
    try {
      await updateProductMutation.mutateAsync({
        id: selectedProduct.id,
        productData: editProduct
      });
      
      console.log('✅ Product updated successfully!');
      handleCloseEditDialog();
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      // הודעה תוצג אוטומטית על ידי ה-hook
    }
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
                    <IconButton 
                      size="small" 
                      title="צפה"
                      onClick={() => handleViewProduct(product)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      title="ערוך"
                      onClick={() => handleEditProduct(product)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      title="מופעים"
                      onClick={() => handleManageInstances(product)}
                    >
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
                        <IconButton 
                          size="small" 
                          title="צפה"
                          onClick={() => handleViewProduct(product)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          title="ערוך"
                          onClick={() => handleEditProduct(product)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          title="מופעים"
                          onClick={() => handleManageInstances(product)}
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

      {/* דיאלוג צפייה במוצר */}
      <Dialog 
        open={isViewDialogOpen} 
        onClose={handleCloseViewDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon />
          {t('products.view_product')}
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            sx={{ marginLeft: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedProduct.name}
                </Typography>
              </Grid>
              {selectedProduct.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('products.description')}
                  </Typography>
                  <Typography variant="body1">
                    {selectedProduct.description}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  {t('products.category')}
                </Typography>
                <Typography variant="body1">
                  {selectedProduct.category}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  {t('products.manufacturer')}
                </Typography>
                <Typography variant="body1">
                  {selectedProduct.manufacturer || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  {t('products.model')}
                </Typography>
                <Typography variant="body1">
                  {selectedProduct.model || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  {t('products.status')}
                </Typography>
                <Chip
                  label={getStatusText(
                    productInstances?.filter(inst => inst.productId === selectedProduct.id && inst.isAvailable)?.length || 0,
                    productInstances?.filter(inst => inst.productId === selectedProduct.id)?.length || 0
                  )}
                  color={getStatusColor(
                    productInstances?.filter(inst => inst.productId === selectedProduct.id && inst.isAvailable)?.length || 0,
                    productInstances?.filter(inst => inst.productId === selectedProduct.id)?.length || 0
                  )}
                  size="small"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג עריכת מוצר */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={handleCloseEditDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          {t('products.edit_product')}
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{ marginLeft: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={t('products.productName')}
                value={editProduct.name}
                onChange={(e) => handleEditProductFieldChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('products.description')}
                value={editProduct.description}
                onChange={(e) => handleEditProductFieldChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>{t('products.category')}</InputLabel>
                <Select
                  value={editProduct.category}
                  onChange={(e) => handleEditProductFieldChange('category', e.target.value)}
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
                value={editProduct.manufacturer}
                onChange={(e) => handleEditProductFieldChange('manufacturer', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('products.model')}
                value={editProduct.model}
                onChange={(e) => handleEditProductFieldChange('model', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveEditProduct}
            variant="contained"
            disabled={updateProductMutation.isPending || !editProduct.name?.trim() || !editProduct.category?.trim()}
          >
            {updateProductMutation.isPending ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* דיאלוג ניהול מופעי מוצר */}
      <Dialog 
        open={isInstancesDialogOpen} 
        onClose={handleCloseInstancesDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeIcon />
          {t('products.manage_instances')}
          {selectedProduct && (
            <Typography variant="body1" sx={{ ml: 2, color: 'text.secondary' }}>
              - {selectedProduct.name}
            </Typography>
          )}
          <IconButton
            aria-label="close"
            onClick={handleCloseInstancesDialog}
            sx={{ marginLeft: 'auto' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('products.product_instances')}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    // TODO: Implement add product instance
                    console.log('➕ Add instance for product:', selectedProduct.id);
                  }}
                >
                  {t('products.add_instance')}
                </Button>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {t('products.total_instances')}: {productInstances?.filter(inst => inst.productId === selectedProduct.id)?.length || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('products.available_instances')}: {productInstances?.filter(inst => inst.productId === selectedProduct.id && inst.isAvailable)?.length || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {t('products.borrowed_instances')}: {productInstances?.filter(inst => inst.productId === selectedProduct.id && !inst.isAvailable)?.length || 0}
                </Typography>
              </Box>

              {productInstances?.filter(inst => inst.productId === selectedProduct.id)?.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {t('products.no_instances')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('products.no_instances_hint')}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {productInstances
                    ?.filter(inst => inst.productId === selectedProduct.id)
                    ?.map((instance) => (
                      <Card key={instance.id} sx={{ mb: 2 }}>
                        <CardContent sx={{ pb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {instance.serialNumber || instance.id}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {t('products.instance_status')}: {instance.isAvailable ? t('products.instance_available') : t('products.instance_borrowed')}
                              </Typography>
                              {instance.condition && (
                                <Typography variant="body2" color="textSecondary">
                                  {t('products.physical_condition')}: {instance.condition}
                                </Typography>
                              )}
                            </Box>
                            <Box>
                              <Chip
                                label={instance.isAvailable ? t('products.instance_available') : t('products.instance_borrowed')}
                                color={instance.isAvailable ? 'success' : 'warning'}
                                size="small"
                              />
                            </Box>
                          </Box>
                        </CardContent>
                        <CardActions sx={{ pt: 0 }}>
                          <Button 
                            size="small" 
                            onClick={() => {
                              // TODO: Implement edit instance
                              console.log('✏️ Edit instance:', instance);
                            }}
                          >
                            {t('products.edit_instance')}
                          </Button>
                          <Button 
                            size="small" 
                            color="error"
                            onClick={() => {
                              // TODO: Implement delete instance
                              console.log('🗑️ Delete instance:', instance);
                            }}
                          >
                            {t('products.delete_instance')}
                          </Button>
                        </CardActions>
                      </Card>
                    ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstancesDialog}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;