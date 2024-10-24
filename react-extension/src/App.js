import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';


import theme from './themes/theme';
import Messages from './components/Message/Messages';
import Header from './components/common/Header';
import MessageInput from './components/Message/MessageInput';
import VersionText from './components/common/VersionText';
import Welcome from './components/common/Welcome';

import { useUser } from './context/UserContext';

function App() {
  const { user } = useUser();

  return (
    <ThemeProvider theme={theme}>
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
        {user ? (
          // Assistant Screen
          <>
            <Header />
            <Divider sx={{ width: '100%' }} />
            <Messages />
            <Box 
              display="flex" 
              flexDirection="column"
              alignItems="center" 
              justifyContent="center" 
              width="100%" 
              position="sticky" 
              bottom={0} 
              bgcolor="background.paper"
              sx={{ mx: 2 }}
            >
              <Divider sx={{ width: '100%', mb: 1 }} />
              <MessageInput />
            </Box>
          </>
        ) : (
          // Welcome Screen
          <Welcome />
        )}
        <VersionText />
      </Box>
    </ThemeProvider>
  );
}

export default App;


// TODO: Make Margins Consistent
