import React, { useEffect } from 'react';
import { audioState } from '../stores/audioState';
import { gameState } from '../stores/gameState';

/**
 * AudioManager component that handles music playback based on game state
 * This is a utility component with no UI - it should be placed near the top of the app
 */
export const AudioManager: React.FC = () => {
  useEffect(() => {
    // Initialize audio
    audioState.initAudio();
    
    // Subscribe to game state changes to manage audio playback
    const unsubscribe = gameState.subscribe(state => {
      // Only play music during home screen and gameplay
      const shouldPlay = ['home', 'playing'].includes(state.screen);
      audioState.playPause(shouldPlay);
    });
    
    // Initial play state based on current game state
    const shouldPlay = ['home', 'playing'].includes(gameState.current.screen);
    audioState.playPause(shouldPlay);
    
    // Cleanup on unmount
    return () => {
      unsubscribe();
      // Pause audio when component unmounts
      if (audioState.audioElement) {
        audioState.audioElement.pause();
      }
    };
  }, []);
  
  // This component doesn't render anything
  return null;
}; 