import React, { useEffect, useRef } from 'react';
import Message from './Message';
import { useMessages } from '../../context/MessageContext';
import { useUser } from '../../context/UserContext';
import { Box, List, ListItem } from '@mui/material';

function Messages() {
    const { user } = useUser();
    const { messages, refreshMessages } = useMessages();

    // Dummy ref to scroll to the bottom:
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            refreshMessages();
        }
        // Including refreshMessages as dependency causes infinite re-render - useCallback
    }, [user]);

    useEffect(() => {
        // Scrolling to the bottom whenever messages changes:
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <Box 
            sx={{ 
                height: '100%',
            }}
        >
            <List sx={{ padding: 0, margin: 0 }} aria-label="Conversation messages">
                {messages
                    // Filtering out empty messages:
                    .filter(message => message.text?.trim())
                    .map((message, index) => (
                        <ListItem key={index}>
                            <Message message={message} />
                        </ListItem>
                    ))}
                <div ref={messagesEndRef} />
            </List>
        </Box>
    );
}

export default Messages;