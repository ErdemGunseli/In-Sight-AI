import { useContext } from 'react';
import AudioPlayerContext from '../context/AudioPlayerContext';

function useAudioPlayer(encodedAudio, messageId) {
  const { isPlaying, playingMessageId, toggleAudio } = useContext(AudioPlayerContext);

  const isMessagePlaying = isPlaying && playingMessageId === messageId;

  const handleToggleAudio = () => {
    if (encodedAudio && messageId !== undefined) {
      toggleAudio(encodedAudio, messageId);
    }
  };

  return { isPlaying: isMessagePlaying, toggleAudio: handleToggleAudio };
}

export default useAudioPlayer;