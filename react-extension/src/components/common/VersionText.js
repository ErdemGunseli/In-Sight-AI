import React from 'react';
import { Typography } from '@mui/material';

function VersionText() {
  return (
    <Typography 
      variant="caption" 
      sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: '50%', 
        transform: 'translateX(-50%)',
        mt: 2,
        fontSize: '0.75rem', 
        color: 'grey.500' 
      }}
    >
      in-sight.ai · version 2.0
    </Typography>
  );
}

export default VersionText;
