import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';

import theme from './themes/theme';
import LoginButton from './components/User/LoginButton';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          
          <Typography variant="title" style={{ fontSize: '3rem' }} gutterBottom>
            in-sight.ai
          </Typography>

          <LoginButton sx={{ fontSize: '1.5rem' }}/>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;


// TODO: Create Components
// TODO: Create Theme
// TODO: Create Context



