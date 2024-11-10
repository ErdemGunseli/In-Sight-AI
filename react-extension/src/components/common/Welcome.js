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
      sx={{ width: '100%', height: '100vh', p: '0.5rem 1rem' }}
    >
      <Typography variant="title" sx={{ fontSize: '2.5rem', mb: 2 }}>
        in-sight.ai
      </Typography>
      <LoginButton sx={{ fontSize: '1.75rem' }}/>
    </Box>
  );
}

export default Welcome;
