import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { VolumeUp, StopCircle, Image as ImageIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';

import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { updateMessageFeedback } from '../../api/assistant';

function Message({ message }) {
    const isUser = message.type === 'user';
    const { isPlaying, toggleAudio } = useAudioPlayer(message.encoded_audio, message.id);

    const [feedback, setFeedback] = useState(message.feedback);

    const handleClick = () => message.encoded_audio && toggleAudio();

    const handleFeedback = async (feedback) => {
        await updateMessageFeedback(message.id, feedback);
        setFeedback(feedback);
        toast.success('Descriptions will be improved.');
    };

    const showFeedback = message.type === 'assistant' && feedback === 'neutral';

    return (
        <Box
            component="div"
            display="flex"
            justifyContent={isUser ? 'flex-end' : 'flex-start'}
            maxWidth="100%"
            width="100%"
        >
            <Paper
                elevation={3}
                variant={isUser ? 'user' : 'assistant'}
                sx={{
                    position: 'relative',
                    maxWidth: '80%',
                    textAlign: isUser ? 'right' : 'left',
                    padding: '8px',
                    overflow: 'hidden',
                }}
            >
                <Box
                    tabIndex={message.encoded_audio ? 0 : -1}
                    role={message.encoded_audio ? 'button' : 'group'}
                    aria-label={
                        message.encoded_audio
                            ? isPlaying
                                ? 'Stop playback'
                                : 'Play audio message'
                            : 'Message'
                    }
                    sx={{
                        cursor: message.encoded_audio ? 'pointer' : 'default',
                        outline: 'none',
                        marginBottom: '4px',
                    }}
                    onClick={handleClick}
                >
                    {message.text?.trim() ? (
                        <Typography variant="body1" gutterBottom>
                            {message.text}
                        </Typography>
                    ) : message.encoded_image ? (
                        <img
                            src={`data:image/png;base64,${message.encoded_image}`}
                            alt="Message content"
                            style={{ maxWidth: '100%', height: 'auto' }}
                        />
                    ) : (
                        <ImageIcon
                            style={{ color: '#a9a9a9' }}
                            aria-label="Image message"
                        />
                    )}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '6px',
                    }}
                >
                    {showFeedback && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                onClick={() => handleFeedback('positive')}
                                aria-label="Thumbs up"
                                size="medium"
                                sx={{ color: 'lightgray', padding: '6px' }}
                            >
                                <ThumbUpOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={() => handleFeedback('negative')}
                                aria-label="Thumbs down"
                                size="medium"
                                sx={{ color: 'lightgray', padding: '6px' }}
                            >
                                <ThumbDownOutlinedIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}

                    {/* Spacer to push the audio icon to the right */}
                    <Box sx={{ flexGrow: 1 }} />

                    {message.encoded_audio && (
                        <IconButton
                            aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
                            onClick={handleClick}
                            size="medium"
                            sx={{ color: 'white', padding: '6px' }}
                        >
                            {isPlaying ? (
                                <StopCircle
                                    aria-label="Stop audio"
                                    fontSize="medium"
                                />
                            ) : (
                                <VolumeUp
                                    aria-label="Play audio"
                                    fontSize="medium"
                                />
                            )}
                        </IconButton>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default Message;