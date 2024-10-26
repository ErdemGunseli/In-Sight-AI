import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

import { completion } from '../../api/assistant';
import { useMessages } from '../../context/MessageContext';

function MessageInput() {
    const [isMuted, setMuted] = useState(true);
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const { messages, setMessages } = useMessages(); // Assuming setMessages is available
    const textInputRef = useRef(null);

    useEffect(() => {
        if (textInputRef.current) {
            textInputRef.current.focus();
        }
    }, []);

    const toggleMute = () => setMuted(!isMuted);

    const handleSendMessage = () => {
        if (loading) return; // Prevent sending if loading is true

        setLoading(true); // Set loading to true immediately

        // Add the user's message to the messages list
        setMessages((prevMessages) => [...prevMessages, { type: 'user', text: textInput }]);

        // Clear the text input after sending the message
        setTextInput('');

        // Start the screen capture and completion process
        handleCaptureScreen();
    };

    const handleCaptureScreen = () => {

        chrome.runtime.sendMessage({ action: 'captureScreen' }, (response) => {

            if (!response || !response.success) {
                console.error("Error capturing screen:", response ? response.error : "No response received");
                alert("Error capturing screen.");
                return;
            }

            const encodedImage = response.imageData;

            // Prepare parameters for the completion function
            const text = textInput; // Get the text from the input
            const generateAudio = !isMuted; // Determine if audio should be generated

            // Make a request to the completion function
            setLoading(true);
            completion(text, encodedImage, generateAudio)
                .then((result) => {
                    console.log("Completion result:", result);
                    // Add the response to the messages list
                    setMessages((prevMessages) => [...prevMessages, result]);
                })
                .catch((error) => {
                    console.error("Error during completion:", error);
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
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%">
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
                        onKeyPress={handleKeyPress} // Added to handle Enter key press
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
        </Box>
    );
}

export default MessageInput;
