import { useState, useRef, useEffect } from 'react';

function useAudioPlayer(encodedAudio) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (encodedAudio) {
            audioRef.current = new Audio(`data:audio/wav;base64,${encodedAudio}`);
            audioRef.current.addEventListener('ended', () => setIsPlaying(false));
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
            }
        };
    }, [encodedAudio]);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            }
        }
    };

    return { isPlaying, toggleAudio };
}

export default useAudioPlayer;