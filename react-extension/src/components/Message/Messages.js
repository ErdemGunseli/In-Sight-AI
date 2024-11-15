import React, { useEffect, useRef } from 'react';
import Message from './Message';
import { useMessages } from '../../context/MessageContext';
import { useUser } from '../../context/UserContext';
import { Box, List, ListItem, Typography } from '@mui/material';

function Messages() {
    const { user } = useUser();
    const { messages, refreshMessages } = useMessages();

    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            refreshMessages();
        }
    }, [user]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const hasMessages = messages.some(
        (message) =>
            (message.text && message.text.trim()) || message.encoded_image
    );

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: hasMessages ? 'flex-start' : 'center',
                alignItems: 'center',
            }}
        >
            {hasMessages ? (
                <List
                    sx={{ padding: 0, margin: 0, width: '100%' }}
                    aria-label="Conversation messages"
                >
                    {messages
                        .filter(
                            (message) =>
                                (message.text && message.text.trim()) ||
                                message.encoded_image
                        )
                        .map((message, index) => (
                            <ListItem key={index}>
                                <Message message={message} />
                            </ListItem>
                        ))}
                    <div ref={messagesEndRef} />
                </List>
            ) : (
                <>
                    <img
                        src="/assets/background_logo.svg"
                        alt="Background Logo"
                        style={{ width: '100px', marginBottom: '20px' }}
                    />
                    <Typography
                        variant="subtitle1"
                        align="center"
                        sx={{ color: '#a9a9a9' }}
                    >
                        Ask a question to begin
                    </Typography>
                </>
            )}
        </Box>
    );
}

export default Messages;