import React, { useEffect, useState } from 'react';
import { audioState, MusicTrack } from '../stores/audioState';
import { sfxState } from '../stores/sfxState';
import '../Game.css';

// Music track names for displaying in the UI
const trackNames: Record<MusicTrack, string> = {
  adventure: 'Adventure',
  cute: 'Cute Beats',
  energy: 'Energy',
  lofi: 'Lo-Fi'
};

// Array of track IDs for easy navigation
const trackIds: MusicTrack[] = ['adventure', 'cute', 'energy', 'lofi'];

export const AudioControls: React.FC = () => {
  // Local state that mirrors the global audioState and sfxState
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(audioState.current.currentTrack);
  const [musicVolume, setMusicVolume] = useState(audioState.current.volume);
  const [isMusicMuted, setIsMusicMuted] = useState(audioState.current.isMuted);
  const [sfxVolume, setSfxVolume] = useState(sfxState.current.sfxVolume);
  const [isSfxMuted, setIsSfxMuted] = useState(sfxState.current.isMuted);

  // Initialize audio on component mount
  useEffect(() => {
    audioState.initAudio();
    sfxState.initSfx();

    // Subscribe to audio state changes
    const unsubscribeMusic = audioState.subscribe((state) => {
      setCurrentTrack(state.currentTrack);
      setMusicVolume(state.volume);
      setIsMusicMuted(state.isMuted);
    });

    // Subscribe to sfx state changes
    const unsubscribeSfx = sfxState.subscribe((state) => {
      setSfxVolume(state.sfxVolume);
      setIsSfxMuted(state.isMuted);
    });

    // Clean up subscriptions on unmount
    return () => {
      unsubscribeMusic();
      unsubscribeSfx();
    };
  }, []);

  // Get current track index
  const currentTrackIndex = trackIds.indexOf(currentTrack);

  // Handle track navigation
  const navigateTrack = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentTrackIndex + 1) % trackIds.length
      : (currentTrackIndex - 1 + trackIds.length) % trackIds.length;
    
    const newTrack = trackIds[newIndex];
    audioState.setTrack(newTrack);
    
    // Play a menu selection sound
    sfxState.playSfx('menuSelect');
  };

  // Handle music volume change
  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    audioState.setVolume(newVolume);
  };

  // Handle SFX volume change
  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    sfxState.setSfxVolume(newVolume);
    
    // Play a test sound when adjusting volume
    sfxState.playSfx('menuSelect');
  };

  // Handle mute toggles
  const handleMusicMuteToggle = () => {
    audioState.toggleMute();
    sfxState.playSfx('menuSelect');
  };

  const handleSfxMuteToggle = () => {
    const wasMuted = sfxState.current.isMuted;
    sfxState.toggleMute();
    
    // Play a test sound only when unmuting
    if (wasMuted) {
      setTimeout(() => sfxState.playSfx('menuSelect'), 100);
    }
  };

  return (
    <div className="audio-controls">
      <h2 className="settings-section-title">Audio Settings</h2>
      
      <div className="audio-section">
        <h3 className="audio-section-title">Music Track</h3>
        <div className="track-carousel">
          <button 
            className="carousel-btn prev-btn" 
            onClick={() => navigateTrack('prev')}
            aria-label="Previous track"
          >
            ◀
          </button>
          
          <div className="current-track">
            <div className="track-name">{trackNames[currentTrack]}</div>
          </div>
          
          <button 
            className="carousel-btn next-btn" 
            onClick={() => navigateTrack('next')}
            aria-label="Next track"
          >
            ▶
          </button>
        </div>
        
        <div className="volume-control">
          <div className="volume-label">
            <span>Music Volume:</span>
            <span className="volume-value">{Math.round(musicVolume * 100)}%</span>
          </div>
          
          <div className="volume-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              className="volume-slider"
              disabled={isMusicMuted}
              aria-label="Music volume"
            />
            
            <button
              className={`mute-btn ${isMusicMuted ? 'muted' : ''}`}
              onClick={handleMusicMuteToggle}
              aria-label={isMusicMuted ? "Unmute music" : "Mute music"}
            >
              {isMusicMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="audio-section">
        <h3 className="audio-section-title">Sound Effects</h3>
        
        <div className="volume-control">
          <div className="volume-label">
            <span>SFX Volume:</span>
            <span className="volume-value">{Math.round(sfxVolume * 100)}%</span>
          </div>
          
          <div className="volume-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={handleSfxVolumeChange}
              className="volume-slider"
              disabled={isSfxMuted}
              aria-label="Sound effects volume"
            />
            
            <button
              className={`mute-btn ${isSfxMuted ? 'muted' : ''}`}
              onClick={handleSfxMuteToggle}
              aria-label={isSfxMuted ? "Unmute sound effects" : "Mute sound effects"}
            >
              {isSfxMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 