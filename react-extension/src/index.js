import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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
          <App />
        </MessageProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
