import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import { completion } from '../../api/assistant';
import { useMessages } from '../../context/MessageContext'; // Import the useMessages hook

function MessageInput() {
    const [isMuted, setMuted] = useState(true);
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const { refreshMessages } = useMessages(); // Destructure refreshMessages from the context
    const textInputRef = useRef(null); // Create a ref for the text input

    useEffect(() => {
        if (textInputRef.current) {
            textInputRef.current.focus(); // Set focus to the text input
        }
    }, []); // Empty dependency array ensures this runs once on mount

    const toggleMute = () => setMuted(!isMuted);

    const handleCaptureScreen = async () => {
        setLoading(true);
        chrome.runtime.sendMessage({ action: 'captureScreen' }, async (response) => {
            const encodedImage = response; // Assuming response contains the base64 image
            try {
                await completion(textInput, encodedImage, !isMuted);
            } catch (error) {
                console.error('Error during completion:', error);
            } finally {
                setLoading(false);
            }
        });
    };

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      sx={{
        borderRadius: '10px',
        padding: '0',
        width: '95%',
        mx: 0,
        mt: 0,
        mb: 3.5,
      }}
    >
      <Box 
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TextField 
          variant="outlined"
          placeholder="Ask anything about what's on-screen..."
          fullWidth
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          inputRef={textInputRef} // Attach the ref to the TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleMute}>
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>

                <IconButton 
                  onClick={handleCaptureScreen}
                  sx={{ 
                    borderRadius: '50%', 
                    backgroundImage: 'linear-gradient(135deg, #6a5acd 0%, #1976d2 20%, #1976d2 80%, #6a5acd 100%)', 
                    color: '#ffffff' 
                  }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : <AutoFixHighIcon />}
                </IconButton >
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <IconButton 
        sx={{ 
            ml: 1.5,
            borderRadius: '50%', 
            color: '#1976d2' 
        }}
      >
        <GraphicEqIcon />
      </IconButton>
    </Box>
  );
}

export default MessageInput;
