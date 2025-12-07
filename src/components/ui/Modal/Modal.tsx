import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  IconButton,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Close } from '@mui/icons-material';

export interface ModalProps extends Omit<DialogProps, 'title'> {
  /** Modal title */
  title?: string;
  /** Whether modal is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal content */
  children?: React.ReactNode;
  /** Footer content */
  actions?: React.ReactNode;
  /** Modal size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking outside closes modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing escape closes modal */
  closeOnEscape?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  title,
  open,
  onClose,
  children,
  actions,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  ...props
}) => {
  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'backdropClick' && !closeOnBackdropClick) {
      return;
    }
    if (reason === 'escapeKeyDown' && !closeOnEscape) {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={size}
      fullWidth
      dir="rtl"
      {...props}
    >
      {title && (
        <>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" component="span">
                {title}
              </Typography>
              {showCloseButton && (
                <IconButton
                  onClick={onClose}
                  size="small"
                  aria-label="סגור"
                  sx={{ ml: 1 }}
                >
                  <Close />
                </IconButton>
              )}
            </Box>
          </DialogTitle>
          <Divider />
        </>
      )}
      
      {children && (
        <DialogContent>
          {children}
        </DialogContent>
      )}
      
      {actions && (
        <>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            {actions}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default Modal;