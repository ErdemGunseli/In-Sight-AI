import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Divider, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material';
import { MoreVert as MoreVertIcon, Delete as DeleteIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { logout } from '../../api/auth';
import { deleteUser } from '../../api/user';
import { deleteMessages } from '../../api/assistant';
import { useMessages } from '../../context/MessageContext';

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showDeleteMessagesDialog, setShowDeleteMessagesDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
 
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const { refreshMessages } = useMessages();

  const handleDeleteMessages = async () => {
    await deleteMessages();
    refreshMessages();
    setShowDeleteMessagesDialog(false);
    handleMenuClose();
  };

  const handleDeleteAccount = async () => {
    await deleteUser();
    logout();
    setShowDeleteAccountDialog(false);
    handleMenuClose();
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" px={2}>
      {/* Existing header content */}
      <Box>
      <Typography variant="title" sx={{ fontSize: '2.25rem' }}>
        in-sight.ai
      </Typography>      </Box>

      {/* Menu Icon */}
      <IconButton
        aria-label="settings"
        aria-controls={open ? 'settings-menu' : undefined}
        aria-haspopup="true"
        onClick={handleMenuClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="settings-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Log Out</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setShowDeleteMessagesDialog(true)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>Delete Messages</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setShowDeleteAccountDialog(true)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>Delete Account</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation Dialogs */}
      {/* Delete Messages Confirmation */}
      <Dialog
        open={showDeleteMessagesDialog}
        onClose={() => setShowDeleteMessagesDialog(false)}
        aria-labelledby="delete-messages-dialog-title"
        aria-describedby="delete-messages-dialog-description"
      >
        <DialogTitle id="delete-messages-dialog-title">Delete All Messages</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-messages-dialog-description">
            Are you sure you want to delete all messages? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteMessagesDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteMessages} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation */}
      <Dialog
        open={showDeleteAccountDialog}
        onClose={() => setShowDeleteAccountDialog(false)}
        aria-labelledby="delete-account-dialog-title"
        aria-describedby="delete-account-dialog-description"
      >
        <DialogTitle id="delete-account-dialog-title">Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-account-dialog-description">
            Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteAccountDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Header;