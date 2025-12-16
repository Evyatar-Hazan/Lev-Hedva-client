import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Menu,
  MenuItem,
  Paper,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Collapse,
  Autocomplete,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { COLORS } from '../theme/colors';

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'date' | 'autocomplete';
  options?: { value: any; label: string }[];
  placeholder?: string;
  autocompleteOptions?: any[];
  getOptionLabel?: (option: any) => string;
}

export interface ActiveFilter {
  id: string;
  value: any;
  label: string;
  displayValue: string;
}

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  availableFilters: FilterOption[];
  activeFilters: ActiveFilter[];
  onFilterAdd: (filterId: string, value: any) => void;
  onFilterRemove: (filterId: string) => void;
  onClearAll?: () => void;
  showClearAll?: boolean;
  disabled?: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  availableFilters,
  activeFilters,
  onFilterAdd,
  onFilterRemove,
  onClearAll,
  showClearAll = true,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFilterForAdd, setSelectedFilterForAdd] = useState<FilterOption | null>(null);
  const [filterInputValue, setFilterInputValue] = useState<any>('');
  const [showFilters, setShowFilters] = useState(true);

  // פילטרים זמינים שעדיין לא הופעלו
  const availableFiltersToAdd = availableFilters.filter(
    filter => !activeFilters.some(active => active.id === filter.id)
  );

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
    setSelectedFilterForAdd(null);
    setFilterInputValue(null);
  };

  const handleFilterSelect = (filter: FilterOption) => {
    setSelectedFilterForAdd(filter);
    // אתחול הערך לפי סוג הפילטר
    if (filter.type === 'multiselect') {
      setFilterInputValue([]);
    } else if (filter.type === 'autocomplete') {
      setFilterInputValue(null);
    } else {
      setFilterInputValue('');
    }
  };

  const handleFilterApply = () => {
    if (selectedFilterForAdd && filterInputValue !== '' && filterInputValue !== null) {
      // בדיקה אם זה multiselect ריק
      if (Array.isArray(filterInputValue) && filterInputValue.length === 0) {
        return;
      }
      onFilterAdd(selectedFilterForAdd.id, filterInputValue);
      handleFilterMenuClose();
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      activeFilters.forEach(filter => onFilterRemove(filter.id));
    }
    onSearchChange('');
  };

  const renderFilterInput = () => {
    if (!selectedFilterForAdd) return null;

    switch (selectedFilterForAdd.type) {
      case 'select':
        return (
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>{selectedFilterForAdd.label}</InputLabel>
            <Select
              value={filterInputValue}
              onChange={e => setFilterInputValue(e.target.value)}
              label={selectedFilterForAdd.label}
            >
              {selectedFilterForAdd.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <Autocomplete
            multiple
            fullWidth
            size="small"
            sx={{ mt: 2 }}
            options={selectedFilterForAdd.options || []}
            getOptionLabel={option => option.label}
            value={filterInputValue}
            onChange={(_, newValue) => setFilterInputValue(newValue)}
            renderInput={params => <TextField {...params} label={selectedFilterForAdd.label} />}
          />
        );

      case 'autocomplete':
        return (
          <Autocomplete
            fullWidth
            size="small"
            sx={{ mt: 2 }}
            options={selectedFilterForAdd.autocompleteOptions || []}
            getOptionLabel={selectedFilterForAdd.getOptionLabel || (option => String(option))}
            value={filterInputValue}
            onChange={(_, newValue) => setFilterInputValue(newValue)}
            renderInput={params => <TextField {...params} label={selectedFilterForAdd.label} />}
          />
        );

      case 'date':
        return (
          <TextField
            fullWidth
            size="small"
            type="date"
            label={selectedFilterForAdd.label}
            value={filterInputValue}
            onChange={e => setFilterInputValue(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'text':
      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={selectedFilterForAdd.label}
            placeholder={selectedFilterForAdd.placeholder}
            value={filterInputValue}
            onChange={e => setFilterInputValue(e.target.value)}
            sx={{ mt: 2 }}
          />
        );
    }
  };

  const hasActiveContent = searchValue || activeFilters.length > 0;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      {/* שורת חיפוש וכפתורים */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        {/* שדה חיפוש */}
        <TextField
          fullWidth
          size="small"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder || t('common.search')}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.default,
            },
          }}
        />

        {/* כפתור הוספת פילטר */}
        {availableFiltersToAdd.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            endIcon={<FilterIcon />}
            onClick={handleFilterMenuOpen}
            disabled={disabled}
            sx={{
              minWidth: isMobile ? '100%' : '140px',
              borderColor: COLORS.border.light,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.light + '10',
              },
            }}
          >
            {t('common.add_filter')}
          </Button>
        )}

        {/* כפתור הצג/הסתר פילטרים */}
        {activeFilters.length > 0 && !isMobile && (
          <IconButton
            size="small"
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              border: `1px solid ${COLORS.border.light}`,
              borderRadius: 1,
            }}
          >
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}

        {/* כפתור ניקוי הכל */}
        {showClearAll && hasActiveContent && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            onClick={handleClearAll}
            disabled={disabled}
            sx={{
              minWidth: isMobile ? '100%' : '120px',
            }}
          >
            {t('common.clear_all')}
          </Button>
        )}
      </Box>

      {/* תצוגת פילטרים פעילים */}
      <Collapse in={showFilters && activeFilters.length > 0}>
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {activeFilters.map(filter => (
            <Chip
              key={filter.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {filter.label}:
                  </Typography>
                  <Typography variant="caption">{filter.displayValue}</Typography>
                </Box>
              }
              onDelete={() => onFilterRemove(filter.id)}
              disabled={disabled}
              sx={{
                backgroundColor: theme.palette.primary.light + '20',
                borderColor: theme.palette.primary.main,
                border: '1px solid',
                '& .MuiChip-deleteIcon': {
                  color: theme.palette.primary.main,
                  '&:hover': {
                    color: theme.palette.primary.dark,
                  },
                },
              }}
            />
          ))}
        </Box>
      </Collapse>

      {/* תפריט הוספת פילטר */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterMenuClose}
        PaperProps={{
          sx: {
            minWidth: isMobile ? '90vw' : isTablet ? '400px' : '450px',
            maxWidth: isMobile ? '90vw' : '500px',
            p: 2,
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {!selectedFilterForAdd ? (
          // רשימת פילטרים זמינים
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              {t('common.select_filter')}
            </Typography>
            {availableFiltersToAdd.map(filter => (
              <MenuItem
                key={filter.id}
                onClick={() => handleFilterSelect(filter)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '15',
                  },
                }}
              >
                <FilterIcon sx={{ mr: 1, fontSize: 20, color: COLORS.icon.default }} />
                {filter.label}
              </MenuItem>
            ))}
          </Box>
        ) : (
          // טופס הוספת ערך לפילטר
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton size="small" onClick={() => setSelectedFilterForAdd(null)} sx={{ mr: 1 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {selectedFilterForAdd.label}
              </Typography>
            </Box>

            {renderFilterInput()}

            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Button fullWidth variant="outlined" onClick={handleFilterMenuClose}>
                {t('common.cancel')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleFilterApply}
                disabled={
                  !filterInputValue ||
                  (Array.isArray(filterInputValue) && filterInputValue.length === 0)
                }
              >
                {t('common.apply')}
              </Button>
            </Box>
          </Box>
        )}
      </Menu>
    </Paper>
  );
};

export default SearchAndFilter;
