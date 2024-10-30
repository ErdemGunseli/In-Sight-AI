import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

import { completion } from '../../api/assistant';
import { useMessages } from '../../context/MessageContext';
import AudioPlayerContext from '../../context/AudioPlayerContext';
import { resizeBase64Image } from '../../utils/imageUtils';

function MessageInput() {
  const [isMuted, setMuted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const { addMessage } = useMessages();
  const textInputRef = useRef(null);
  const { toggleAudio } = useContext(AudioPlayerContext);

  useEffect(() => {
    textInputRef.current?.focus();
  }, []);

  const toggleMute = () => setMuted(!isMuted);

  const handleSendMessage = () => {
    if (loading) return;

    setLoading(true);

    const userMessage = { type: 'user', text: textInput };
    addMessage(userMessage);
    setTextInput('');

    handleCaptureScreen(userMessage);
  };

  const handleCaptureScreen = (userMessage) => {
    chrome.runtime.sendMessage({ action: 'captureScreen' }, (response) => {
      if (!response || !response.success) {
        console.error('Error capturing screen:', response?.error || 'No response received');
        alert('Error capturing screen.');
        setLoading(false);
        return;
      }

      const { imageData: encodedImage } = response;
      const generateAudio = !isMuted;

      resizeBase64Image(encodedImage)
        .then((compressedImageData) => {
          return completion(textInput, compressedImageData, generateAudio);
        })
        .then((result) => {
          // Optionally update userMessage with its assigned ID from the backend, if provided
          if (result.userMessageId) {
            userMessage.id = result.userMessageId;
            // Update the user's message in the state
            addMessage({ ...userMessage });
          }

          // Add the assistant's response as a new message
          const assistantMessage = {
            type: 'assistant',
            text: result.text,
            encoded_audio: result.encoded_audio,
            id: result.id, // Assuming the assistant's message ID is returned as 'id'
          };
          addMessage(assistantMessage);

          // Play audio if available
          if (result.encoded_audio && !isMuted) {
            toggleAudio(result.encoded_audio, assistantMessage.id);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        width: '100%',
        mb: 2.5,
        mt: 1,
      }}
    >
      <TextField
        variant="outlined"
        placeholder="Ask anything about what's on-screen..."
        fullWidth
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        onKeyPress={handleKeyPress}
        inputRef={textInputRef}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={toggleMute}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <IconButton
                onClick={handleSendMessage}
                sx={{
                  borderRadius: '50%',
                  backgroundImage:
                    'linear-gradient(135deg, #6a5acd 0%, #1976d2 20%, #1976d2 80%, #6a5acd 100%)',
                  color: '#ffffff',
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} style={{ color: '#ffffff' }} />
                ) : (
                  <AutoFixHighIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ flexGrow: 1, ml: 2 }}
      />
      <Box display="flex" alignItems="center">
        <IconButton sx={{ borderRadius: '50%', color: '#1976d2', mx: 1 }}>
          <GraphicEqIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default MessageInput;