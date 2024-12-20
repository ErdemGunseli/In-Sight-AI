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
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        minWidth: 500,
        minHeight: 600,
        width: '80vw',
        height: '80vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {user ? (
        <>
          <Header />
          <Divider sx={{ width: '100%' }} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Messages />
            </Box>
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                width: '100%',
              }}
            >
              <Divider sx={{ width: '100%' }} />
              <MessageInput />
            </Box>
          </Box>
        </>
      ) : (
        <Welcome />
      )}
      <VersionText />
    </Box>
  );
}

export default App;