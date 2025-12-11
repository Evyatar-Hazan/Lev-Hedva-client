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
import StatsGrid from '../components/StatsGrid';
import { useProducts, useProductInstances, useCreateProduct, useUpdateProduct, useUpdateProductInstance, useCreateProductInstance, useDeleteProductInstance, useProductCategories, useProductManufacturers } from '../hooks';
import { CreateProductDto, UpdateProductDto, UpdateProductInstanceDto, CreateProductInstanceDto } from '../lib/types';
import { COLORS } from '../theme/colors';

// רכיב פשוט לתצוגת מופעים
const ProductInstancesView: React.FC<{ 
  product: any; 
  instances: any[]; 
  onEditInstance: (instance: any) => void;
  onDeleteInstance: (instance: any) => void;
}> = ({ product, instances, onEditInstance, onDeleteInstance }) => {
  const { t } = useTranslation();
  
  if (!instances || instances.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <InventoryIcon sx={{ fontSize: 80, color: COLORS.icon.disabled, mb: 2 }} />
        <Typography variant="h5" gutterBottom color="text.secondary">
          {t('products.no_instances')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {t('products.add_first_instance')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {instances.map((instance) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={instance.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { boxShadow: 4 },
                transition: 'box-shadow 0.2s ease-in-out'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <QrCodeIcon sx={{ mr: 1, color: COLORS.icon.primary }} />
                  <Typography variant="h6" fontWeight="bold">
                    {instance.barcode || `מופע ${instance.id.slice(-4)}`}
                  </Typography>
                </Box>
                
                {instance.serialNumber && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('products.serial_number')}:</strong> {instance.serialNumber}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('products.condition')}:</strong>
                  </Typography>
                  <Chip
                    label={instance.condition}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('products.status')}:</strong>
                  </Typography>
                  <Chip
                    label={instance.isAvailable ? t('products.available') : t('products.borrowed')}
                    color={instance.isAvailable ? 'success' : 'warning'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                
                {instance.location && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>{t('products.location')}:</strong> {instance.location}
                  </Typography>
                )}
                
                {instance.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    <strong>{t('products.notes')}:</strong> {instance.notes}
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => onEditInstance(instance)}
                  variant="outlined"
                >
                  {t('common.edit')}
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<CloseIcon />}
                  onClick={() => onDeleteInstance(instance)}
                  variant="outlined"
                >
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
  
  // משתנים לקטגוריות חדשות
  const [customCategory, setCustomCategory] = useState('');
  const [customManufacturer, setCustomManufacturer] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false);
  
  // משתנים לניהול תצוגה
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isViewingInstances, setIsViewingInstances] = useState(false);
  
  // דיאלוגי פעולות מוצרים
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddInstanceDialogOpen, setIsAddInstanceDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [isEditInstanceDialogOpen, setIsEditInstanceDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingInstance, setEditingInstance] = useState<any>(null);
  
  const [newProduct, setNewProduct] = useState<CreateProductDto>({
    name: '',
    description: '',
    category: '',
    manufacturer: '',
    model: '',
  });
  
  const [newInstance, setNewInstance] = useState<CreateProductInstanceDto>({
    productId: '',
    barcode: '',
    serialNumber: '',
    condition: 'חדש',
    location: '',
    notes: '',
  });
  
  const [editProduct, setEditProduct] = useState<UpdateProductDto>({
    name: '',
    description: '',
    category: '',
    manufacturer: '',
    model: '',
  });
  
  const [editInstance, setEditInstance] = useState<UpdateProductInstanceDto>({
    barcode: '',
    serialNumber: '',
    condition: '',
    location: '',
    notes: '',
  });
  
  // שימוש בהוכים
  const { data: productsData, isLoading, error } = useProducts({ 
    page,
    limit: 100 // מספר גבוה יותר למוצרים רבים
  });
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const updateInstanceMutation = useUpdateProductInstance();
  const createInstanceMutation = useCreateProductInstance();
  const deleteInstanceMutation = useDeleteProductInstance();
  const { data: productInstances } = useProductInstances();
  const { data: categories = [] } = useProductCategories();
  const { data: manufacturers = [] } = useProductManufacturers();

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
    setCustomCategory('');
    setCustomManufacturer('');
    setShowCustomCategory(false);
    setShowCustomManufacturer(false);
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

  // פונקציות עריכת מוצרים
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditProduct({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      manufacturer: product.manufacturer || '',
      model: product.model || '',
    });
    setIsEditProductDialogOpen(true);
  };

  const handleSaveEditedProduct = async () => {
    if (!editingProduct?.id) return;
    
    try {
      await updateProductMutation.mutateAsync({
        id: editingProduct.id,
        productData: editProduct
      });
      setIsEditProductDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleCloseEditProduct = () => {
    setIsEditProductDialogOpen(false);
    setEditingProduct(null);
    setEditProduct({
      name: '',
      description: '',
      category: '',
      manufacturer: '',
      model: '',
    });
    setCustomCategory('');
    setCustomManufacturer('');
    setShowCustomCategory(false);
    setShowCustomManufacturer(false);
  };

  // פונקציות עריכת מופעים
  const handleEditInstance = (instance: any) => {
    setEditingInstance(instance);
    setEditInstance({
      barcode: instance.barcode || '',
      serialNumber: instance.serialNumber || '',
      condition: instance.condition || '',
      location: instance.location || '',
      notes: instance.notes || '',
    });
    setIsEditInstanceDialogOpen(true);
  };

  // פונקציה ליצירת ברקוד אוטומטי
  const generateBarcode = () => {
    if (!selectedProduct) return '';
    
    // יצירת קיצור משם המוצר
    const productName = selectedProduct.name;
    let prefix = '';
    
    // קיצורים לפי קטגוריה
    const category = selectedProduct.category?.toLowerCase() || '';
    if (category.includes('כסא') || category.includes('גלגל')) {
      prefix = 'WC';
    } else if (category.includes('הליכ') || category.includes('הליכון')) {
      prefix = 'WAL';
    } else if (category.includes('מיט') || category.includes('מטה')) {
      prefix = 'BED';
    } else if (category.includes('שמיע')) {
      prefix = 'HA';
    } else if (category.includes('ראי')) {
      prefix = 'VA';
    } else if (category.includes('רחצ')) {
      prefix = 'BA';
    } else {
      // אם לא מצאנו קטגוריה, נשתמש באותיות הראשונות של השם
      const words = productName.split(' ').filter((word: string) => word.length > 0);
      if (words.length >= 2) {
        prefix = (words[0][0] + words[1][0]).toUpperCase();
      } else if (words.length === 1) {
        prefix = words[0].substring(0, 2).toUpperCase();
      } else {
        prefix = 'ITEM';
      }
    }
    
    // חישוב המספר הרץ על בסיס מופעים קיימים
    const existingInstances = productInstances?.filter(inst => inst.productId === selectedProduct.id) || [];
    const nextNumber = String(existingInstances.length + 1).padStart(3, '0');
    
    return `${prefix}${nextNumber}`;
  };

  const handleGenerateBarcode = () => {
    const suggestedBarcode = generateBarcode();
    setNewInstance(prev => ({ ...prev, barcode: suggestedBarcode }));
  };

  // פונקציות להוספת מופע חדש
  const handleAddInstance = () => {
    console.log('🔄 Adding new instance for product:', selectedProduct);
    if (selectedProduct && selectedProduct.id) {
      const suggestedBarcode = generateBarcode();
      setNewInstance({
        productId: selectedProduct.id,
        barcode: suggestedBarcode, // ברקוד אוטומטי
        serialNumber: '',
        condition: 'excellent',
        location: '',
        notes: '',
      });
      console.log('📋 New instance initialized with productId:', selectedProduct.id, 'and barcode:', suggestedBarcode);
      setIsAddInstanceDialogOpen(true);
    } else {
      console.error('❌ Error: selectedProduct or selectedProduct.id is missing');
      alert('שגיאה: לא נמצא מוצר נבחר');
    }
  };

  const handleCloseAddInstance = () => {
    setIsAddInstanceDialogOpen(false);
    setNewInstance({
      productId: '',
      barcode: '',
      serialNumber: '',
      condition: 'excellent',
      location: '',
      notes: '',
    });
  };

  const handleSaveInstance = async () => {
    console.log('🔄 Starting instance save process...');
    console.log('📋 Current instance state:', newInstance);
    
    // ולידציה שה-productId קיים
    if (!newInstance.productId) {
      console.error('❌ Error: productId is missing');
      alert('שגיאה: לא נמצא מזהה מוצר');
      return;
    }
    
    // ולידציה שברקוד קיים (שדה חובה)
    if (!newInstance.barcode || newInstance.barcode.trim() === '') {
      console.error('❌ Error: barcode is required');
      alert('שגיאה: ברקוד הוא שדה חובה');
      return;
    }
    
    // ניקוי והכנת הדאטה
    const cleanedInstanceData = {
      productId: newInstance.productId.trim(),
      barcode: newInstance.barcode.trim(),
      ...(newInstance.serialNumber?.trim() && { serialNumber: newInstance.serialNumber.trim() }),
      ...(newInstance.condition?.trim() && { condition: newInstance.condition.trim() }),
      ...(newInstance.location?.trim() && { location: newInstance.location.trim() }),
      ...(newInstance.notes?.trim() && { notes: newInstance.notes.trim() }),
    };
    
    console.log('🧹 Cleaned instance data:', cleanedInstanceData);
    
    try {
      console.log('📤 Sending instance data:', cleanedInstanceData);
      const result = await createInstanceMutation.mutateAsync(cleanedInstanceData as any);
      console.log('✅ Instance created successfully:', result);
      handleCloseAddInstance();
    } catch (error) {
      console.error('❌ Failed to create instance:', error);
      
      // הצגת פרטי השגיאה
      if (error && typeof error === 'object') {
        const errorDetails = {
          message: (error as any)?.message,
          status: (error as any)?.response?.status,
          statusText: (error as any)?.response?.statusText,
          data: (error as any)?.response?.data,
        };
        console.error('Error details:', errorDetails);
        
        // הצגת הודעת שגיאה מפורטת
        let errorMessage = 'שגיאה בהוספת המופע';
        if (errorDetails.data?.message) {
          if (Array.isArray(errorDetails.data.message)) {
            errorMessage += ':\n• ' + errorDetails.data.message.join('\n• ');
          } else {
            errorMessage += ': ' + errorDetails.data.message;
          }
        } else if (errorDetails.message) {
          errorMessage += ': ' + errorDetails.message;
        }
        
        alert(errorMessage);
      }
    }
  };

  // פונקציה למחיקת מופע
  const handleDeleteInstance = async (instance: any) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את המופע ${instance.barcode || instance.id.slice(-4)}?`)) {
      try {
        await deleteInstanceMutation.mutateAsync(instance.id);
      } catch (error) {
        console.error('Failed to delete instance:', error);
      }
    }
  };

  const handleSaveEditedInstance = async () => {
    if (!editingInstance?.id) return;
    
    try {
      await updateInstanceMutation.mutateAsync({
        id: editingInstance.id,
        instanceData: editInstance
      });
      setIsEditInstanceDialogOpen(false);
      setEditingInstance(null);
    } catch (error) {
      console.error('Failed to update instance:', error);
    }
  };

  const handleCloseEditInstance = () => {
    setIsEditInstanceDialogOpen(false);
    setEditingInstance(null);
    setEditInstance({
      barcode: '',
      serialNumber: '',
      condition: '',
      location: '',
      notes: '',
    });
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
      <>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleBackToProducts} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {t('products.instancesTitle')} - {selectedProduct.name}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddInstance}
              size="large"
            >
              {t('products.addInstance')}
            </Button>
          </Box>
          
          {/* כאן נוסיף את תצוגת המופעים */}
          <ProductInstancesView 
            product={selectedProduct} 
            instances={productInstances?.filter(inst => inst.productId === selectedProduct.id) || []}
            onEditInstance={handleEditInstance}
            onDeleteInstance={handleDeleteInstance}
          />
        </Box>

        {/* Add Instance Dialog */}
        <Dialog 
          open={isAddInstanceDialogOpen} 
          onClose={handleCloseAddInstance}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t('products.addInstance')}
            <IconButton
              aria-label="close"
              onClick={handleCloseAddInstance}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: COLORS.icon.secondary,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('products.barcode')}
                  value={newInstance.barcode}
                  onChange={(e) => setNewInstance(prev => ({ ...prev, barcode: e.target.value }))}
                  helperText="שדה חובה - ברקוד ייחודי למופע"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={handleGenerateBarcode}
                        edge="end"
                        size="small"
                        title="יצירת ברקוד אוטומטי"
                      >
                        <QrCodeIcon />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('products.serial_number')}
                  value={newInstance.serialNumber}
                  onChange={(e) => setNewInstance(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('products.condition')}</InputLabel>
                  <Select
                    value={newInstance.condition}
                    onChange={(e) => setNewInstance(prev => ({ ...prev, condition: e.target.value }))}
                    label={t('products.condition')}
                  >
                    <MenuItem value="excellent">{t('products.conditions.excellent')}</MenuItem>
                    <MenuItem value="good">{t('products.conditions.good')}</MenuItem>
                    <MenuItem value="fair">{t('products.conditions.fair')}</MenuItem>
                    <MenuItem value="poor">{t('products.conditions.poor')}</MenuItem>
                    <MenuItem value="needs-repair">{t('products.conditions.needs_repair')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('products.location')}
                  value={newInstance.location}
                  onChange={(e) => setNewInstance(prev => ({ ...prev, location: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('products.notes')}
                  value={newInstance.notes}
                  onChange={(e) => setNewInstance(prev => ({ ...prev, notes: e.target.value }))}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseAddInstance}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSaveInstance}
              variant="contained"
              disabled={createInstanceMutation.isPending || !newInstance.barcode?.trim()}
            >
              {createInstanceMutation.isPending ? <CircularProgress size={20} /> : t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Instance Dialog */}
        <Dialog 
          open={isEditInstanceDialogOpen} 
          onClose={handleCloseEditInstance}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {t('editInstance')}
            <IconButton
              aria-label="close"
              onClick={handleCloseEditInstance}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: COLORS.icon.secondary,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('products.barcode')}
                  value={editInstance.barcode}
                  onChange={(e) => setEditInstance(prev => ({ ...prev, barcode: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('products.serial_number')}
                  value={editInstance.serialNumber}
                  onChange={(e) => setEditInstance(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('products.condition')}</InputLabel>
                  <Select
                    value={editInstance.condition}
                    onChange={(e) => setEditInstance(prev => ({ ...prev, condition: e.target.value }))}
                    label={t('products.condition')}
                  >
                    <MenuItem value="excellent">{t('products.conditions.excellent')}</MenuItem>
                    <MenuItem value="good">{t('products.conditions.good')}</MenuItem>
                    <MenuItem value="fair">{t('products.conditions.fair')}</MenuItem>
                    <MenuItem value="poor">{t('products.conditions.poor')}</MenuItem>
                    <MenuItem value="needs-repair">{t('products.conditions.needs_repair')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('products.location')}
                  value={editInstance.location}
                  onChange={(e) => setEditInstance(prev => ({ ...prev, location: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('products.notes')}
                  value={editInstance.notes}
                  onChange={(e) => setEditInstance(prev => ({ ...prev, notes: e.target.value }))}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseEditInstance}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSaveEditedInstance}
              variant="contained"
              disabled={updateInstanceMutation.isPending}
            >
              {updateInstanceMutation.isPending ? <CircularProgress size={20} /> : t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
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
      <StatsGrid stats={[
        {
          icon: <InventoryIcon />,
          value: (productsData as any)?.total || 0,
          label: t('products.stats.totalProducts'),
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          icon: <QrCodeIcon />,
          value: productInstances?.length || 0,
          label: t('products.stats.productInstances'),
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
          icon: <VisibilityIcon />,
          value: productInstances?.filter(i => i.isAvailable).length || 0,
          label: t('products.available'),
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        {
          icon: <InventoryIcon />,
          value: productInstances?.filter(i => !i.isAvailable).length || 0,
          label: t('products.borrowed'),
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        },
      ]} />

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
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
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
                    '&:hover': { boxShadow: 4, backgroundColor: COLORS.action.hover },
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
                  
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                    >
                      {t('common.edit')}
                    </Button>
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
                <TableCell align="center">{t('products.total_instances')}</TableCell>
                <TableCell align="center">{t('products.available_instances')}</TableCell>
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
                    <TableRow 
                      key={product.id}
                      sx={{ 
                        cursor: 'pointer', 
                        '&:hover': { backgroundColor: COLORS.action.hover }
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
                        <IconButton 
                          size="small" 
                          title={t('common.edit')}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                        >
                          <EditIcon />
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
              color: COLORS.icon.secondary,
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
                  value={showCustomCategory ? 'custom' : newProduct.category}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomCategory(true);
                      handleProductFieldChange('category', customCategory);
                    } else {
                      setShowCustomCategory(false);
                      handleProductFieldChange('category', e.target.value);
                    }
                  }}
                  label={t('products.category')}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                  <MenuItem value="custom">
                    <em>{t('products.categories.add_new')}</em>
                  </MenuItem>
                </Select>
              </FormControl>
              {showCustomCategory && (
                <TextField
                  fullWidth
                  label={t('products.categories.new_category')}
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    handleProductFieldChange('category', e.target.value);
                  }}
                  sx={{ mt: 2 }}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {showCustomManufacturer ? (
                <TextField
                  fullWidth
                  label={t('products.manufacturer')}
                  value={customManufacturer}
                  onChange={(e) => {
                    setCustomManufacturer(e.target.value);
                    handleProductFieldChange('manufacturer', e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => {
                          setShowCustomManufacturer(false);
                          setCustomManufacturer('');
                          handleProductFieldChange('manufacturer', '');
                        }}
                        edge="end"
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                    )
                  }}
                />
              ) : (
                <FormControl fullWidth>
                  <InputLabel>{t('products.manufacturer')}</InputLabel>
                  <Select
                    value={newProduct.manufacturer}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setShowCustomManufacturer(true);
                      } else {
                        handleProductFieldChange('manufacturer', e.target.value);
                      }
                    }}
                    label={t('products.manufacturer')}
                  >
                    {manufacturers.map(manufacturer => (
                      <MenuItem key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">
                      <em>{t('products.manufacturers.add_new')}</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
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

      {/* Edit Product Dialog */}
      <Dialog 
        open={isEditProductDialogOpen} 
        onClose={handleCloseEditProduct}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('editProduct')}
          <IconButton
            aria-label="close"
            onClick={handleCloseEditProduct}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: COLORS.icon.secondary,
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
                value={editProduct.name}
                onChange={(e) => setEditProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('products.description')}
                value={editProduct.description}
                onChange={(e) => setEditProduct(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>{t('products.category')}</InputLabel>
                <Select
                  value={editProduct.category}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, category: e.target.value }))}
                  label={t('products.category')}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('products.manufacturer')}</InputLabel>
                <Select
                  value={editProduct.manufacturer}
                  onChange={(e) => setEditProduct(prev => ({ ...prev, manufacturer: e.target.value }))}
                  label={t('products.manufacturer')}
                >
                  {manufacturers.map(manufacturer => (
                    <MenuItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('products.model')}
                value={editProduct.model}
                onChange={(e) => setEditProduct(prev => ({ ...prev, model: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseEditProduct}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSaveEditedProduct}
            variant="contained"
            disabled={updateProductMutation.isPending || !editProduct.name?.trim() || !editProduct.category?.trim()}
          >
            {updateProductMutation.isPending ? <CircularProgress size={20} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;