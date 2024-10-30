import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  StopCircle as StopCircleIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import useAudioPlayer from '../../hooks/useAudioPlayer';

function Message({ message }) {
  const isUser = message.type === 'user';

  const messageId = message.id;

  const { isPlaying, toggleAudio } = useAudioPlayer(
    message.encoded_audio,
    messageId
  );

  const handleClick = () => {
    if (message.encoded_audio) {
      toggleAudio();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick();
    }
  };

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
        style={{
          position: 'relative',
          maxWidth: '80%',
          textAlign: isUser ? 'right' : 'left',
        }}
      >
        <Box
          onClick={handleClick}
          onKeyDown={handleKeyDown}
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
          }}
        >
          {message.text && message.text.trim() ? (
            <Typography variant="body1" gutterBottom>
              {message.text}
            </Typography>
          ) : (
            <ImageIcon
              style={{ color: '#a9a9a9' }}
              aria-label="Image message"
            />
          )}
          {message.encoded_audio && (
            <Box
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {isPlaying ? (
                <StopCircleIcon aria-label="Stop audio" />
              ) : (
                <VolumeUpIcon aria-label="Play audio" />
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default Message;