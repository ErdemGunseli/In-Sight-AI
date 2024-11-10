import React from 'react';
import { Box, Typography } from '@mui/material';
import SettingsMenu from './SettingsMenu';

function Header() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      px={2}
    >
      <Box>
        <Typography variant="title" sx={{ fontSize: '2.25rem' }}>
          in-sight.ai
        </Typography>
      </Box>
      <SettingsMenu />
    </Box>
  );
}

export default Header;