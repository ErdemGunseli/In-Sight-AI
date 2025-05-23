import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { VolumeOff, VolumeUp, AutoFixHigh, GraphicEq } from '@mui/icons-material';

import { completion, saveAudioSetting, getAudioSetting } from '../../api/assistant';
import { useMessages } from '../../context/MessageContext';
import AudioPlayerContext from '../../context/AudioPlayerContext';
import { resizeBase64Image } from '../../utils/imageUtils';

function MessageInput() {
  const [isMuted, setMuted] = useState(getAudioSetting());
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');

  const { addMessage } = useMessages();
  const { toggleAudio } = useContext(AudioPlayerContext);

  const textInputRef = useRef(null);

  useEffect(() => {
    textInputRef.current?.focus();
  }, []);

  const toggleMute = () => {
    setMuted((prevIsMuted) => {
      const newIsMuted = !prevIsMuted;
      saveAudioSetting(newIsMuted);
      return newIsMuted;
    });
  };

  const captureScreen = () =>
    new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'captureScreen' }, (response) => {
        if (!response || !response.success) {
          reject(response?.error || 'No response received');
        } else {
          resolve(response);
        }
      });
    });

  const handleSendMessage = async () => {
    if (loading) return;
    setLoading(true);

    const userMessage = { type: 'user', text: textInput };
    addMessage(userMessage);
    setTextInput('');

    try {
      const { imageData: encodedImage } = await captureScreen();
  
      const compressedImageData = await resizeBase64Image(encodedImage);
      const assistantMessage = await completion(textInput, compressedImageData, !isMuted);

      addMessage(assistantMessage);

      if (assistantMessage.encoded_audio && !isMuted) {
        toggleAudio(assistantMessage.encoded_audio, assistantMessage.id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
        sx={{ flexGrow: 1, ml: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={toggleMute}
                aria-label={isMuted ? 'Turn On Audio' : 'Turn Off Audio'}
              >
                {isMuted ? <VolumeOff /> : <VolumeUp />}
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
                aria-label="Send Message"
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: '#ffffff' }}
                    aria-label="Sending..."
                  />
                ) : (
                  <AutoFixHigh />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box display="flex" alignItems="center">
        <IconButton
          sx={{ borderRadius: '50%', color: '#1976d2', mx: 1 }}
          aria-label="Real-Time Conversation"
        >
          <GraphicEq />
        </IconButton>
      </Box>
    </Box>
  );
}

export default MessageInput;