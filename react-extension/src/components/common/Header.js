import React from 'react';
import { Box, Typography } from '@mui/material';
import LoginButton from '../Login/LoginButton';

function Header() {
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      width="100%" 
      padding="0.5rem 1rem"
      boxSizing="border-box"
    >
      <Typography variant="title" sx={{ fontSize: '2rem' }}>
        in-sight.ai
      </Typography>
      
      <LoginButton sx={{ fontSize: '1rem' }}/>
    </Box>
  );
}

export default Header;