import React, { useState, useEffect, createContext, useContext } from 'react';
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
    setMessages([]);
  };

  const addMessage = (message) => {
    setMessages((prevMessages) => {
      // Check if the message already exists
      if (prevMessages.some((msg) => msg.id === message.id)) {
        return prevMessages; // Do not add duplicate
      }
      return [...prevMessages, message];
    });
  };

  // Refreshing the message data when the MessageProvider mounts:
  useEffect(() => {
    const fetchData = async () => {
      await refreshMessages();
    };
    fetchData();
  }, []);

  return (
    <MessageContext.Provider
      value={{ messages, setMessages, refreshMessages, clearMessages, addMessage }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;

// Custom hook to simplify usage
export const useMessages = () => {
  return useContext(MessageContext);
};

