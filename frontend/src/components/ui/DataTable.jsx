import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Chip,
  Typography,
  Box
} from '@mui/material';

const DataTable = ({
  columns,
  data,
  actions = [],
  emptyMessage = "No data available",
  stickyHeader = false,
  maxHeight = null,
  size = "medium"
}) => {
  const renderCellContent = (rowData, column) => {
    const cellValue = column.field ? rowData[column.field] : null;

    if (column.render) {
      return column.render(rowData, cellValue);
    }

    switch (column.type) {
      case 'chip':
        return (
          <Chip
            label={cellValue}
            size="small"
            color={column.chipColor ? column.chipColor(cellValue) : 'default'}
            variant={column.chipVariant || 'filled'}
          />
        );

      case 'date':
        return cellValue ? new Date(cellValue).toLocaleDateString() : '-';

      case 'datetime':
        return cellValue ? new Date(cellValue).toLocaleString() : '-';

      case 'boolean':
        return cellValue ? 'Yes' : 'No';

      case 'actions':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {Array.isArray(actions) && actions.map((action, actionIndex) => (
              action.buttonText ? (
                <Button
                  key={action.key || action.title || `action-${actionIndex}`}
                  size="small"
                  variant={action.variant || 'outlined'}
                  color={action.color || 'primary'}
                  onClick={() => action.onClick(rowData)}
                  disabled={action.disabled ? action.disabled(rowData) : false}
                  startIcon={action.icon}
                  sx={{
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.75,
                    lineHeight: 1.2
                  }}
                >
                  {action.buttonText}
                </Button>
              ) : (
                <IconButton
                  key={action.key || action.title || `action-${actionIndex}`}
                  size="small"
                  color={action.color || 'default'}
                  onClick={() => action.onClick(rowData)}
                  disabled={action.disabled ? action.disabled(rowData) : false}
                  title={action.title}
                >
                  {action.icon}
                </IconButton>
              )
            ))}
          </Box>
        );

      default:
        return cellValue || '-';
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: maxHeight,
        ...(stickyHeader && { height: maxHeight || 400 })
      }}
    >
      <Table
        stickyHeader={stickyHeader}
        size={size}
        aria-label="data table"
      >
        <TableHead>
          <TableRow>
            {Array.isArray(columns) && columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{
                  minWidth: column.minWidth,
                  width: column.width,
                  fontWeight: 'bold'
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {!Array.isArray(data) || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={Array.isArray(columns) ? columns.length : 1} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((rowItem, rowIndex) => (
              <TableRow
                key={rowItem.id || rowItem.uuid || `row-${rowIndex}`}
                hover
                tabIndex={-1}
              >
                {Array.isArray(columns) && columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                  >
                    {renderCellContent(rowItem, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;