import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';
import { UserProvider } from './context/UserContext';
import { MessageProvider } from './context/MessageContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes/theme';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <UserProvider>
        <MessageProvider>
        <ToastContainer 
                position='top-left'
                autoClose={2500}
                pauseOnHover
                style={{ zIndex: 9999 }}
              />          <App />
        </MessageProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
