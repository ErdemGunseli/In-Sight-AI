import React, { useState, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { VolumeUp as VolumeUpIcon, StopCircle as StopCircleIcon } from '@mui/icons-material';

function Message({ message }) {
    // Whether the message is created by the user or the assistant:
    const isUser = message.type === 'user';

    // State for audio playback:
    const [isPlaying, setIsPlaying] = useState(false);

    // If encoded audio provided, creating a new HTMLAudioElement instance:
    // The 'useRef' hook creates a mutable object, and does not cause a re-render if it changes:
    const audioRef = useRef(message.encoded_audio ? new Audio(`data:audio/wav;base64,${message.encoded_audio}`) : null);


    const toggleAudio = () => {
        // Toggling audio playback:
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <Box 
            display="flex" 
            // User messages are aligned to the end (right); assistant messages are aligned to the start:
            justifyContent={isUser ? 'flex-end' : 'flex-start'}
            // If encoded audio is provided, showing a pointer since clicking toggles playback:
            cursor={message.encoded_audio ? 'pointer' : 'default'}
            maxWidth="100%"
            width="100%"
            onClick={message.encoded_audio ? toggleAudio : undefined}
        >
            <Paper 
                elevation={3} 
                variant={isUser ? 'user' : 'assistant'}
                style={{ 
                    position: 'relative',
                    maxWidth: '80%',
                    textAlign: isUser ? 'right' : 'left',
                }}
            >
                <Box>
                    {message.text && (
                        <Typography variant="body1" gutterBottom>
                            {message.text}
                        </Typography>
                    )}
                    <Box 
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        {message.encoded_audio && (
                            isPlaying ? (
                                <StopCircleIcon 
                                    style={{ 
                                        color: 'white', 
                                        cursor: 'pointer' 
                                    }} 
                                />
                            ) : (
                                <VolumeUpIcon 
                                    style={{ 
                                        color: 'white', 
                                        cursor: 'pointer' 
                                    }} 
                                />
                            )
                        )}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default Message;
