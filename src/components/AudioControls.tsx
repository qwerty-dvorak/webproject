import React, { useEffect, useState } from 'react';
import { audioState, MusicTrack } from '../stores/audioState';
import '../Game.css';

// Music track names for displaying in the UI
const trackNames: Record<MusicTrack, string> = {
  adventure: 'Adventure',
  cute: 'Cute',
  energy: 'Energy',
  lofi: 'Lo-Fi'
};

export const AudioControls: React.FC = () => {
  // Local state that mirrors the global audioState
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(audioState.current.currentTrack);
  const [volume, setVolume] = useState(audioState.current.volume);
  const [isMuted, setIsMuted] = useState(audioState.current.isMuted);

  // Initialize audio on component mount
  useEffect(() => {
    audioState.initAudio();

    // Subscribe to audio state changes
    const unsubscribe = audioState.subscribe((state) => {
      setCurrentTrack(state.currentTrack);
      setVolume(state.volume);
      setIsMuted(state.isMuted);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle track change
  const handleTrackChange = (track: MusicTrack) => {
    audioState.setTrack(track);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    audioState.setVolume(newVolume);
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    audioState.toggleMute();
  };

  return (
    <div className="audio-controls">
      <h2 className="settings-section-title">Music Settings</h2>
      
      <div className="track-selection">
        <h3>Select Track:</h3>
        <div className="track-buttons">
          {Object.entries(trackNames).map(([trackId, trackName]) => (
            <button
              key={trackId}
              className={`track-btn ${currentTrack === trackId ? 'active' : ''}`}
              onClick={() => handleTrackChange(trackId as MusicTrack)}
            >
              {trackName}
            </button>
          ))}
        </div>
      </div>
      
      <div className="volume-control">
        <h3>Volume:</h3>
        <div className="volume-slider-container">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            disabled={isMuted}
          />
          <span className="volume-value">{Math.round(volume * 100)}%</span>
        </div>
      </div>
      
      <div className="mute-control">
        <button
          className={`mute-btn ${isMuted ? 'muted' : ''}`}
          onClick={handleMuteToggle}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
}; 