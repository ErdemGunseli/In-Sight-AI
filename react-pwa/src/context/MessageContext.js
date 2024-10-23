import { useState, useEffect, createContext, useContext } from 'react';

import { getMessages } from '../api/assistant';

// Creating a context for the message data:
const MessageContext = createContext();


export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);


  const refreshMessages = async () => {
    setMessages([]);

    if (!localStorage.getItem('accessToken')) {
      return;
    }

    const response = await getMessages();
    if (Array.isArray(response)) {
      setMessages(response);
    }

    return response;
  };

  const clearMessages = () => {
    setMessages([])
  }


  // Refreshing the message data when the MessageProvider mounts:
  useEffect(() => {
    const fetchData = async () => {
      await refreshMessages();
    };
    fetchData();
  }, []);


  return (
    <MessageContext.Provider value={{ messages, setMessages, refreshMessages, clearMessages }}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;


// Custom hook to simplify usage
export const useMessages = () => {
    return useContext(MessageContext);
};

