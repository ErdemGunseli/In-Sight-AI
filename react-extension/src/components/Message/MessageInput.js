import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

import { completion } from '../../api/assistant';
import { useMessages } from '../../context/MessageContext';
import useAudioPlayer from '../../hooks/useAudioPlayer';

function MessageInput() {
    const [isMuted, setMuted] = useState(true);
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const { messages, setMessages } = useMessages();
    const textInputRef = useRef(null);

    // State to hold the current audio data
    const [currentAudio, setCurrentAudio] = useState(null);
    const { isPlaying, toggleAudio } = useAudioPlayer(currentAudio);

    useEffect(() => {
        textInputRef.current?.focus();
    }, []);

    const toggleMute = () => setMuted(!isMuted);

    const handleSendMessage = () => {
        if (loading) return;

        setLoading(true);
        setMessages((prevMessages) => [...prevMessages, { type: 'user', text: textInput }]);
        setTextInput('');
        handleCaptureScreen();
    };

    const handleCaptureScreen = () => {
        chrome.runtime.sendMessage({ action: 'captureScreen' }, (response) => {
            if (!response || !response.success) {
                console.error("Error capturing screen:", response?.error || "No response received");
                alert("Error capturing screen.");
                return;
            }

            const { imageData: encodedImage } = response;
            const generateAudio = !isMuted;

            completion(textInput, encodedImage, generateAudio)
                .then((result) => {
                    setMessages((prevMessages) => [...prevMessages, result]);
                    if (result.encoded_audio && !isMuted) {
                        setCurrentAudio(result.encoded_audio); // Set the current audio
                        toggleAudio(); // Play audio if not muted
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
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
                                  backgroundImage: 'linear-gradient(135deg, #6a5acd 0%, #1976d2 20%, #1976d2 80%, #6a5acd 100%)', 
                                  color: '#ffffff' 
                              }}
                              disabled={loading}
                          >
                              {loading ? <CircularProgress size={24} style={{ color: '#ffffff' }} /> : <AutoFixHighIcon />}
                          </IconButton>
                      </InputAdornment>
                  ),
              }}
              sx={{ flexGrow: 1, ml: 2}}
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
