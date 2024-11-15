import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';
import { UserProvider } from './context/UserContext';
import { MessageProvider } from './context/MessageContext';
import { AudioPlayerProvider } from './context/AudioPlayerContext';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './themes/theme';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <MessageProvider>
          <AudioPlayerProvider>
            <ToastContainer
              position="top-center"
              autoClose={2000}
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Slide}
            />
            <App />
          </AudioPlayerProvider>
        </MessageProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>,
);