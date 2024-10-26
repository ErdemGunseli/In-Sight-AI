import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { VolumeUp as VolumeUpIcon, StopCircle as StopCircleIcon, Image as ImageIcon } from '@mui/icons-material';
import useAudioPlayer from '../../hooks/useAudioPlayer';

function Message({ message }) {
    const isUser = message.type === 'user';
    const { isPlaying, toggleAudio } = useAudioPlayer(message.encoded_audio);

    return (
        <Box 
            display="flex" 
            justifyContent={isUser ? 'flex-end' : 'flex-start'}
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
                    {message.text && message.text.trim() ? (
                        <Typography variant="body1" gutterBottom>
                            {message.text}
                        </Typography>
                    ) : (
                        <ImageIcon style={{ color: '#a9a9a9' }} />
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
                            isPlaying ? <StopCircleIcon /> : <VolumeUpIcon />
                        )}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default Message;