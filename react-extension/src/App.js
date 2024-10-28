import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';


import Messages from './components/Message/Messages';
import Header from './components/common/Header';
import MessageInput from './components/Message/MessageInput';
import VersionText from './components/common/VersionText';
import Welcome from './components/common/Welcome';

import { useUser } from './context/UserContext';

function App() {
  const { user } = useUser();

  return (
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
        overflow="hidden" // Ensure no extra scrollbars
      >
        {user ? (
          // Assistant Screen
          <>
            <Box height="60px" width="100%">
              <Header />
            </Box>
            <Divider sx={{ width: '100%' }} />
            <Box 
              display="flex"
              flexDirection="column"
              flexGrow={1} 
              width="100%" 
              overflow="hidden" // Prevent overflow from the container itself
            >
              <Box 
                flexGrow={1} 
                overflow="auto" // Allow scrolling within the Messages area
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
              >
                <Divider sx={{ width: '100%' }} />
                <MessageInput />
              </Box>
            </Box>
          </>
        ) : (
          // Welcome Screen
          <Welcome />
        )}
        <VersionText />
      </Box>
  );
}

export default App;


// SAT:
// TODO: Full Code Review
// TODO: Proper error messages from backend
// TODO: Extension Shortcut


// SUN:
// TODO: Image compression to reduce execution
// TODO: Audio should output after request complete.


// MON:
// TODO: Basic Menus
// Full Code Review
// ACCESSIBILITY THEME SWITCHING
// TODO: Make Margins Consistent
