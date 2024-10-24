import React, { useState } from 'react';
import { Box, IconButton, TextField, InputAdornment } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';



function MessageInput() {

    const [isMuted, setMuted] = useState(true);

    const toggleMute = () => setMuted(!isMuted);

    // Define handleCaptureScreen function here
    const handleCaptureScreen = () => {
        chrome.runtime.sendMessage({ action: 'captureScreen' });
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
        mb: 3,
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
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleMute}>
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>

                <IconButton 
                  onClick={handleCaptureScreen}
                  className="MuiIconButton-send" 
                  sx={{ 
                    borderRadius: '50%', 
                    backgroundImage: 'linear-gradient(135deg, #6a5acd 0%, #1976d2 20%, #1976d2 80%, #6a5acd 100%)', 
                    color: '#ffffff' 
                  }}
                >
                  <AutoFixHighIcon />
                </IconButton >
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {/* Move GraphicEqIcon outside of the input */}
      <IconButton 
        className="MuiIconButton-blur" 
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
