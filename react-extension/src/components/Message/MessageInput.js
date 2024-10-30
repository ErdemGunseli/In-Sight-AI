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
    console.log('Sending message to background script...');
    chrome.runtime.sendMessage({ action: 'captureScreen' }, (response) => {
      console.log('Received response from background script:', response);
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
          // Create a new message object for the assistant's response
          const assistantMessage = {
            type: 'assistant',
            text: result.text,
            encoded_audio: result.encoded_audio,
            id: result.id,
            // Include any other properties from the result as needed
          };

          // Add the assistant's message to the messages list
          addMessage(assistantMessage);

          if (result.encoded_audio && !isMuted) {
            toggleAudio(result.encoded_audio, result.id); // Use the actual ID from the backend
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('An error occurred during processing.');
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.target === textInputRef.current) {
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
        onKeyDown={handleKeyDown}
        inputRef={textInputRef}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={toggleMute}
                aria-label={isMuted ? 'Turn On Audio' : 'Turn Off Audio'}
              >
                {isMuted ? (
                  <VolumeOffIcon />
                ) : (
                  <VolumeUpIcon />
                )}
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
                aria-label="Send message"
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    style={{ color: '#ffffff' }}
                    aria-label="Sending..."
                  />
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
        <IconButton
          sx={{ borderRadius: '50%', color: '#1976d2', mx: 1 }}
          aria-label="Audio settings"
        >
          <GraphicEqIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default MessageInput;