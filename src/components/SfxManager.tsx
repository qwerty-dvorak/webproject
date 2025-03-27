import React, { useEffect } from 'react';
import { sfxState } from '../stores/sfxState';

/**
 * SFX Manager component - initializes sound effects on app load
 * This is a utility component with no UI
 */
export const SfxManager: React.FC = () => {
  useEffect(() => {
    // Initialize SFX
    sfxState.initSfx();
    
    // Pre-warm Web Audio API by playing a silent sound
    // This helps avoid first-interaction audio lag
    const warmUpAudio = () => {
      const silentSound = () => {
        sfxState.playSfx('menuSelect');
      };

      // Try to initialize on first user interaction
      const handleInteraction = () => {
        silentSound();
        
        // Remove event listeners after initialization
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      };

      // Listen for first user interaction
      window.addEventListener('click', handleInteraction, { once: true });
      window.addEventListener('keydown', handleInteraction, { once: true });
      window.addEventListener('touchstart', handleInteraction, { once: true });
    };

    warmUpAudio();
  }, []);

  // This component doesn't render anything
  return null;
}; 