import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import theme from './themes/theme';
import { userLoggedIn } from './api/auth';
import LoginButton from './components/User/LoginButton';
import Messages from './components/Message/Messages';

import { UserProvider } from './context/UserContext';
import { MessageProvider } from './context/MessageContext';


function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <MessageProvider>
          <Box 
            display="flex" 
            flexDirection="column" 
            justifyContent="center" 
            alignItems="center" 
            minWidth="500px" 
            minHeight="600px"
            width="80vw" 
            height="80vh"
            position="relative"
          >
            <Typography variant="title" sx={{ mb: 2, fontSize: '3rem' }}>
              in-sight.ai
            </Typography>

            <LoginButton sx={{ fontSize: '1.5rem' }}/>

            {userLoggedIn() && <Messages />}

            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                bottom: 10, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                fontSize: '0.75rem', 
                color: 'grey.500' 
              }}
            >
              in-sight.ai · version 1.0.0
            </Typography>
          </Box>
        </MessageProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;

// TODO: TOAST ERRORS
// TODO: Create Components
// TODO: Create Theme
// TODO: Create Context

