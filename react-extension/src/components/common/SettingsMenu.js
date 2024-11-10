import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Divider, ListItemIcon, ListItemText } from '@mui/material';
import { MoreVert, Delete, Logout } from '@mui/icons-material';

import { logout } from '../../api/auth';
import { deleteUser } from '../../api/user';
import { deleteMessages } from '../../api/assistant';
import { useMessages } from '../../context/MessageContext';
import ConfirmationDialog from '../Window/ConfirmationDialog';

function SettingsMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { refreshMessages } = useMessages();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    window.location.reload();
  };

  const openConfirmDialog = (type) => {
    setDialogType(type);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (dialogType === 'deleteMessages') {
      await deleteMessages();
      refreshMessages();
    } else if (dialogType === 'deleteAccount') {
      await deleteUser();
      logout();
    }
    setConfirmDialogOpen(false);
    window.location.reload();
  };

  return (
    <>
      <IconButton
        aria-label="settings"
        aria-controls={anchorEl ? 'settings-menu' : undefined}
        aria-haspopup="true"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        id="settings-button"
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="settings-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'settings-button',
          role: 'menu',
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleMenuClose();
            openConfirmDialog('deleteMessages');
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Delete Messages"
            primaryTypographyProps={{ color: 'error' }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            openConfirmDialog('deleteAccount');
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Delete Account"
            primaryTypographyProps={{ color: 'error' }}
          />
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirm}
        title={
          dialogType === 'deleteMessages'
            ? 'Delete All Messages'
            : 'Delete Account'
        }
        description={
          dialogType === 'deleteMessages'
            ? 'Are you sure you want to delete all messages? This action cannot be undone.'
            : 'Are you sure you want to delete your account? This action cannot be undone, and you will lose all your data.'
        }
        confirmText={
          dialogType === 'deleteMessages' ? 'Delete Messages' : 'Delete Account'
        }
      />
    </>
  );
}

export default SettingsMenu;
