import React, { createContext, useState, useContext } from 'react';
import { getVoiceSpeed } from '../api/assistant';

const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);

  const playAudio = (encodedAudio, messageId) => {
    if (audioInstance) {
      audioInstance.pause();
    }

    const newAudioInstance = new Audio(`data:audio/wav;base64,${encodedAudio}`);

    // Getting the saved voice speed (default 1 if not set):
    const voiceSpeed = parseFloat(getVoiceSpeed()) || 1;

    // Setting the playback rate:
    newAudioInstance.playbackRate = voiceSpeed;

    setAudioInstance(newAudioInstance);
    setPlayingMessageId(messageId);

    newAudioInstance
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
      });

    newAudioInstance.onended = () => {
      setIsPlaying(false);
      setPlayingMessageId(null);
    };
  };

  const toggleAudio = (encodedAudio, messageId) => {
    if (isPlaying && playingMessageId === messageId) {
      // Pause the current audio
      if (audioInstance) {
        audioInstance.pause();
        setIsPlaying(false);
        setPlayingMessageId(null);
      }
    } else {
      playAudio(encodedAudio, messageId);
    }
  };

  return (
    <AudioPlayerContext.Provider value={{ isPlaying, playingMessageId, toggleAudio }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Custom hook to simplify usage:
export const useAudioPlayer = (encodedAudio, messageId) => {
  const { isPlaying, playingMessageId, toggleAudio } = useContext(AudioPlayerContext);

  const isMessagePlaying = isPlaying && playingMessageId === messageId;

  const handleToggleAudio = () => {
    if (encodedAudio && messageId !== undefined) {
      toggleAudio(encodedAudio, messageId);
    }
  };

  return { isPlaying: isMessagePlaying, toggleAudio: handleToggleAudio };
};

export default AudioPlayerContext; 