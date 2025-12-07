import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Checkbox,
  TableSortLabel
} from '@mui/material';

export interface Column<T = any> {
  /** Column key */
  key: keyof T | string;
  /** Column header label */
  label: string;
  /** Column width */
  width?: string | number;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is sortable */
  sortable?: boolean;
  /** Custom render function */
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Whether column is hidden */
  hidden?: boolean;
}

export interface TableProps<T = any> {
  /** Table columns configuration */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether table has pagination */
  pagination?: boolean;
  /** Current page (0-indexed) */
  page?: number;
  /** Rows per page */
  rowsPerPage?: number;
  /** Total rows count */
  totalRows?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Rows per page change handler */
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Selected row keys */
  selectedRows?: (string | number)[];
  /** Row selection change handler */
  onRowSelectionChange?: (selectedRows: (string | number)[]) => void;
  /** Row key accessor */
  getRowId?: (row: T, index: number) => string | number;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Actions menu render */
  renderActions?: (row: T, index: number) => React.ReactNode;
  /** Sort configuration */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Sort change handler */
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

function Table<T = any>({
  columns,
  data,
  loading = false,
  emptyMessage = 'אין נתונים להצגה',
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  selectable = false,
  selectedRows = [],
  onRowSelectionChange,
  getRowId = (row: T, index: number) => index,
  onRowClick,
  renderActions,
  sortBy,
  sortOrder = 'asc',
  onSortChange,
}: TableProps<T>) {
  const visibleColumns = columns.filter(col => !col.hidden);

  const handleSelectAll = (checked: boolean) => {
    if (!onRowSelectionChange) return;
    if (checked) {
      const allIds = data.map((row, index) => getRowId(row, index));
      onRowSelectionChange(allIds);
    } else {
      onRowSelectionChange([]);
    }
  };

  const handleRowSelect = (rowId: string | number, checked: boolean) => {
    if (!onRowSelectionChange) return;
    if (checked) {
      onRowSelectionChange([...selectedRows, rowId]);
    } else {
      onRowSelectionChange(selectedRows.filter(id => id !== rowId));
    }
  };

  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;
    const newOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(columnKey, newOrder);
  };

  const getCellValue = (row: T, column: Column<T>): any => {
    if (typeof column.key === 'string' && column.key.includes('.')) {
      return column.key.split('.').reduce((obj: any, key: string) => obj?.[key], row);
    }
    return row[column.key as keyof T];
  };

  const renderCell = (row: T, column: Column<T>, rowIndex: number): React.ReactNode => {
    const value = getCellValue(row, column);
    if (column.render) {
      return column.render(value, row, rowIndex);
    }
    return value?.toString() || '';
  };

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <Paper>
      <TableContainer>
        <MuiTable dir="rtl">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
              )}
              {visibleColumns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  align={column.align || 'right'}
                  style={{ width: column.width }}
                >
                  {column.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortBy === column.key}
                      direction={sortBy === column.key ? sortOrder : 'asc'}
                      onClick={() => handleSort(String(column.key))}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell align="center" style={{ width: 48 }}>
                  פעולות
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (renderActions ? 1 : 0)} 
                  align="center"
                >
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (renderActions ? 1 : 0)} 
                  align="center"
                >
                  <Box p={2}>
                    <Typography variant="body2" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId(row, index);
                const isSelected = selectedRows.includes(rowId);
                
                return (
                  <TableRow 
                    key={rowId}
                    selected={isSelected}
                    hover
                    onClick={() => onRowClick?.(row, index)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(rowId, e.target.checked)}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((column) => (
                      <TableCell 
                        key={String(column.key)} 
                        align={column.align || 'right'}
                      >
                        {renderCell(row, column, index)}
                      </TableCell>
                    ))}
                    {renderActions && (
                      <TableCell align="center">
                        {renderActions(row, index)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          component="div"
          count={totalRows || data.length}
          page={page}
          onPageChange={(_, newPage) => onPageChange?.(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
          labelRowsPerPage="שורות בעמוד:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} מתוך ${count !== -1 ? count : `יותר מ ${to}`}`
          }
          dir="rtl"
        />
      )}
    </Paper>
  );
}

export default Table;