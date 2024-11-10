import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material';

function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
}) {

  return (
    <Dialog open={open} onClose={onClose} disableRestoreFocus>
      <DialogTitle>
        <Typography variant="title" sx={{ fontSize: '1.75rem' }}>{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}
          variant="text"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="text"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;
