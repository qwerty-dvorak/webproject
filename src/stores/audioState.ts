// Audio state types and store
export type MusicTrack = 'adventure' | 'cute' | 'energy' | 'lofi';

export interface AudioStateInterface {
  currentTrack: MusicTrack;
  volume: number;
  isMuted: boolean;
}

// Helper to safely parse JSON from localStorage with fallback
const getStoredValue = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
};

// Global store for audio state
export const audioState = {
  // Current state with localStorage persistence
  current: {
    currentTrack: getStoredValue<MusicTrack>('pixelTanks.currentTrack', 'adventure'),
    volume: getStoredValue<number>('pixelTanks.volume', 0.5),
    isMuted: getStoredValue<boolean>('pixelTanks.isMuted', false)
  } as AudioStateInterface,
  
  // Audio element reference
  audioElement: null as HTMLAudioElement | null,
  
  // Listeners
  listeners: [] as Array<(state: AudioStateInterface) => void>,
  
  // Initialize audio
  initAudio: () => {
    if (!audioState.audioElement) {
      audioState.audioElement = new Audio();
      audioState.audioElement.loop = true;
      
      // Apply current state
      audioState.setTrack(audioState.current.currentTrack);
      audioState.setVolume(audioState.current.volume);
      
      if (audioState.current.isMuted) {
        audioState.audioElement.volume = 0;
      }
    }
  },
  
  // Set the current track
  setTrack: (track: MusicTrack) => {
    audioState.current.currentTrack = track;
    localStorage.setItem('pixelTanks.currentTrack', JSON.stringify(track));
    
    if (audioState.audioElement) {
      audioState.audioElement.src = `/bgmusic/${track}.mp3`;
      
      // If not muted, start playing the track
      if (!audioState.current.isMuted) {
        audioState.audioElement.play().catch(e => console.error('Error playing audio:', e));
      }
    }
    
    audioState.notifyListeners();
  },
  
  // Set volume (0-1)
  setVolume: (volume: number) => {
    audioState.current.volume = volume;
    localStorage.setItem('pixelTanks.volume', JSON.stringify(volume));
    
    if (audioState.audioElement && !audioState.current.isMuted) {
      audioState.audioElement.volume = volume;
    }
    
    audioState.notifyListeners();
  },
  
  // Toggle mute
  toggleMute: () => {
    audioState.current.isMuted = !audioState.current.isMuted;
    localStorage.setItem('pixelTanks.isMuted', JSON.stringify(audioState.current.isMuted));
    
    if (audioState.audioElement) {
      audioState.audioElement.volume = audioState.current.isMuted ? 0 : audioState.current.volume;
      
      // If unmuting and audio isn't playing, start it
      if (!audioState.current.isMuted && audioState.audioElement.paused) {
        audioState.audioElement.play().catch(e => console.error('Error playing audio:', e));
      }
    }
    
    audioState.notifyListeners();
  },
  
  // Play or pause music
  playPause: (shouldPlay: boolean) => {
    if (!audioState.audioElement) return;
    
    if (shouldPlay && !audioState.current.isMuted) {
      audioState.audioElement.play().catch(e => console.error('Error playing audio:', e));
    } else {
      audioState.audioElement.pause();
    }
  },
  
  // Subscribe to state changes
  subscribe: (listener: (state: AudioStateInterface) => void) => {
    audioState.listeners.push(listener);
    return () => {
      audioState.listeners = audioState.listeners.filter(l => l !== listener);
    };
  },
  
  // Notify all listeners of state changes
  notifyListeners: () => {
    audioState.listeners.forEach(listener => listener(audioState.current));
  }
}; 