import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { MoreVert, Delete, Logout } from '@mui/icons-material';

import { logout } from '../../api/auth';
import { deleteUser } from '../../api/user';
import { deleteMessages, saveVoiceSetting, getVoiceSetting, saveVoiceSpeed, getVoiceSpeed } from '../../api/assistant';
import { useMessages } from '../../context/MessageContext';
import ConfirmationDialog from '../Window/ConfirmationDialog';

function SettingsMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { refreshMessages } = useMessages();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);

  const [voiceSetting, setVoiceSetting] = useState('alloy');
  const [voiceSpeed, setVoiceSpeed] = useState('1');

  useEffect(() => {
    const savedVoice = getVoiceSetting();
    if (savedVoice) {
      setVoiceSetting(savedVoice);
    }

    const savedSpeed = getVoiceSpeed();
    if (savedSpeed) {
      setVoiceSpeed(savedSpeed);
    }
  }, []);

  const handleVoiceChange = (event) => {
    const newVoice = event.target.value;
    setVoiceSetting(newVoice);
    saveVoiceSetting(newVoice);
  };

  const handleSpeedChange = (event) => {
    const newSpeed = event.target.value;
    setVoiceSpeed(newSpeed);
    saveVoiceSpeed(newSpeed);
  };

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
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel id="voice-select-label">Voice</InputLabel>
            <Select
              labelId="voice-select-label"
              id="voice-select"
              value={voiceSetting}
              label="Voice"
              onChange={handleVoiceChange}
            >
              <MenuItem value="alloy">Alloy</MenuItem>
              <MenuItem value="echo">Echo</MenuItem>
              <MenuItem value="fable">Fable</MenuItem>
              <MenuItem value="onyx">Onyx</MenuItem>
              <MenuItem value="nova">Nova</MenuItem>
              <MenuItem value="shimmer">Shimmer</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel id="speed-select-label">Voice Speed</InputLabel>
            <Select
              labelId="speed-select-label"
              id="speed-select"
              value={voiceSpeed}
              label="Voice Speed"
              onChange={handleSpeedChange}
            >
              <MenuItem value="1">1x</MenuItem>
              <MenuItem value="1.5">1.5x</MenuItem>
              <MenuItem value="2">2x</MenuItem>
              <MenuItem value="2.5">2.5x</MenuItem>
              <MenuItem value="3">3x</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
        <Divider />
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
