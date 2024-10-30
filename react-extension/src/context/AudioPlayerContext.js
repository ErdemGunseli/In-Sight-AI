import React, { createContext, useState } from 'react';

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

export default AudioPlayerContext; 