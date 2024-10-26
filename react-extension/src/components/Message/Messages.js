import React, { useEffect, useRef } from 'react';
import Message from './Message';
import { useMessages } from '../../context/MessageContext';
import { useUser } from '../../context/UserContext';
import { Box } from '@mui/material';

function Messages() {
    const { user } = useUser();
    const { messages, refreshMessages } = useMessages();

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            refreshMessages();
        }
        // Including refreshMessages as dependency causes infinite re-render - use useCallback 
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
                // 'overflowY makes the box scrollable when necessary:
                padding: '10px', 
                height: '100%',
            }}
        >
            {/* 'listStyleType' being 'none' removes bullet points from the list. */}
            <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
                {messages
                    .filter(message => message.text && message.text.trim()) // Filter out empty messages
                    .map((message, index) => (
                        <li key={index} style={{ marginBottom: '10px' }}>
                            <Message message={message} />
                        </li>
                    ))}
                {/* Add a dummy div to act as a scroll target */}
                <div ref={messagesEndRef} />
            </ul>
        </Box>
    );
}

export default Messages;
