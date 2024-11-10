import React, { useState } from 'react';
import { Button, Box } from '@mui/material';

import { useUser } from '../../context/UserContext';
import { logout } from '../../api/auth';
import LoginWindow from './LoginWindow';

function LoginButton({ sx }) {
  const { user } = useUser();

  const [windowOpen, setWindowOpen] = useState(false);

  const handleLoginClick = () => {
    if (user) {
      logout();
    } else {
      setWindowOpen(true)    
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
      <Button
        onClick={handleLoginClick}
        variant={user ? 'text' : 'contained'}
        sx={sx}
        aria-label={user ? 'Log out' : 'Get started'}
      >
        {user ? 'Log Out' : 'Get Started'}
      </Button>

      <LoginWindow isOpen={windowOpen} onClose={() => setWindowOpen(false)} />
    </Box>
  );
}

export default LoginButton;