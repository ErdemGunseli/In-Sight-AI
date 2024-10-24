import React from 'react';
import { Box, Typography } from '@mui/material';
import LoginButton from '../Login/LoginButton';

function Welcome() {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      width="100%" 
      padding="0.5rem 1rem"
      boxSizing="border-box"
    >
      <Typography variant="title" sx={{ fontSize: '2.5rem', mb: '10px' }}>
        in-sight.ai
      </Typography>
      <LoginButton sx={{ fontSize: '1.5rem' }}/>
    </Box>
  );
}

export default Welcome;

