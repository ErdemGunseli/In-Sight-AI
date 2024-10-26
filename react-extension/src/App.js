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
        justifyContent="space-between" 
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
            <Box height="60px" width="100%">
              <Header />
            </Box>
            <Divider sx={{ width: '100%' }} />
            <Box 
              flexGrow={1} 
              width="100%" 
              overflow="auto"
            >
              <Messages />
            </Box>
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
              height="80px"
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
// TODO: More transitions
