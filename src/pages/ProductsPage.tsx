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
import { format } from 'date-fns';

const ProductsPage: React.FC = () => {
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
          שגיאה בטעינת נתוני המוצרים: {error.message}
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
          ניהול מוצרים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          הוספת מוצר
        </Button>
      </Box>

      {/* Debug Panel */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Debug:</strong> טוען: {isLoading ? 'כן' : 'לא'} | 
          שגיאה: {error ? (error as any).message || 'יש שגיאה' : 'אין'} | 
          מוצרים: {products.length} | 
          מופעי מוצרים: {productInstances?.length || 0}
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
                סה"כ מוצרים
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
                מופעי מוצרים
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
                זמינים כעת
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
                מושאלים
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
          <InputLabel>קטגוריה</InputLabel>
          <Select
            value={categoryFilter}
            label="קטגוריה"
            onChange={handleCategoryFilterChange}
          >
            <MenuItem value="all">כל הקטגוריות</MenuItem>
            <MenuItem value="ניידות">ניידות</MenuItem>
            <MenuItem value="ריהוט רפואי">ריהוט רפואי</MenuItem>
            <MenuItem value="עזרי שמיעה">עזרי שמיעה</MenuItem>
            <MenuItem value="עזרי ראייה">עזרי ראייה</MenuItem>
            <MenuItem value="עזרי רחצה">עזרי רחצה</MenuItem>
            <MenuItem value="אחר">אחר</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* טבלת מוצרים */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם המוצר</TableCell>
              <TableCell>קטגוריה</TableCell>
              <TableCell>יצרן</TableCell>
              <TableCell align="center">מופעים</TableCell>
              <TableCell align="center">זמינות</TableCell>
              <TableCell align="center">סטטוס</TableCell>
              <TableCell align="center">פעולות</TableCell>
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
                    לא נמצאו מוצרים
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

      {/* דף */}
      {productsData?.pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            עמוד {productsData.pagination.page} מתוך {Math.ceil(productsData.pagination.total / productsData.pagination.limit)} |
            סה"כ {productsData.pagination.total} מוצרים
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProductsPage;