import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import theme from './themes/theme';
import LoginButton from './components/User/LoginButton';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center" 
          minWidth="500px" 
          minHeight="600px"
          width="80vw" 
          height="80vh"
        >
          <Typography variant="title" sx={{ mb: 2, fontSize: '3rem' }}>
            in-sight.ai
          </Typography>

          <LoginButton sx={{ fontSize: '1.5rem' }}/>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;


// TODO: Create Components
// TODO: Create Theme
// TODO: Create Context



