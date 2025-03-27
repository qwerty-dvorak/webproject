// Leaderboard entry type
export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  date: string;
}

// Number of top scores to track
const MAX_LEADERBOARD_ENTRIES = 5;

// Player name storage and session tracking
const PLAYER_NAME_KEY = 'pixelTanksPlayerName';

// Leaderboard store with local storage persistence
export const leaderboardState = {
  entries: [] as LeaderboardEntry[],
  listeners: [] as Array<() => void>,
  isNewHighScore: false,
  playerName: '',
  nameRequested: false,
  
  // Initialize leaderboard from local storage
  init: () => {
    try {
      // Load player name if exists (from sessionStorage)
      const storedName = sessionStorage.getItem(PLAYER_NAME_KEY);
      if (storedName) {
        leaderboardState.playerName = storedName;
      }
      
      // Load leaderboard (from localStorage)
      const storedData = localStorage.getItem('pixelTanksLeaderboard');
      if (storedData) {
        leaderboardState.entries = JSON.parse(storedData);
      } else {
        // Create empty leaderboard
        leaderboardState.resetLeaderboard();
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      leaderboardState.resetLeaderboard();
    }
    
    leaderboardState.notifyListeners();
  },
  
  // Create a default empty leaderboard
  resetLeaderboard: () => {
    leaderboardState.entries = Array.from({ length: MAX_LEADERBOARD_ENTRIES }, (_, i) => ({
      rank: i + 1,
      name: '-',
      score: 0,
      date: '-'
    }));
    leaderboardState.saveToLocalStorage();
  },
  
  // Set player name and save to storage
  setPlayerName: (name: string) => {
    leaderboardState.playerName = name;
    leaderboardState.nameRequested = true;
    try {
      sessionStorage.setItem(PLAYER_NAME_KEY, name);
    } catch (error) {
      console.error('Error saving player name:', error);
    }
    leaderboardState.notifyListeners();
  },
  
  // Check if we need to request player name
  needsPlayerName: (): boolean => {
    return !leaderboardState.playerName && !leaderboardState.nameRequested;
  },
  
  // Add a new score to the leaderboard if it qualifies
  addScore: (score: number) => {
    // Reset high score flag
    leaderboardState.isNewHighScore = false;
    
    // Skip if score is 0
    if (score === 0) {
      return false;
    }
    
    // Use player name or default
    const playerName = leaderboardState.playerName || 'User';
    
    // Create new entry
    const newEntry: LeaderboardEntry = {
      rank: 0, // Will be set during sorting
      name: playerName,
      score,
      date: new Date().toLocaleDateString()
    };
    
    // Check if score is high enough to be on leaderboard
    const lowestScore = leaderboardState.entries[MAX_LEADERBOARD_ENTRIES - 1].score;
    
    if (score > lowestScore || leaderboardState.entries.some(entry => entry.name === '-')) {
      // Add new entry to the list
      leaderboardState.entries.push(newEntry);
      
      // Sort by score in descending order
      leaderboardState.entries.sort((a, b) => b.score - a.score);
      
      // Check if it's a new high score (rank 1)
      if (leaderboardState.entries[0].score === score) {
        leaderboardState.isNewHighScore = true;
      }
      
      // Trim to max entries and update ranks
      leaderboardState.entries = leaderboardState.entries
        .slice(0, MAX_LEADERBOARD_ENTRIES)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
      
      // Save to local storage
      leaderboardState.saveToLocalStorage();
      leaderboardState.notifyListeners();
      
      return true;
    }
    
    return false;
  },
  
  // Check if a score would be a new high score
  wouldBeHighScore: (score: number): boolean => {
    return score > (leaderboardState.entries[0].name !== '-' ? leaderboardState.entries[0].score : 0);
  },
  
  // Save current state to local storage
  saveToLocalStorage: () => {
    try {
      localStorage.setItem('pixelTanksLeaderboard', JSON.stringify(leaderboardState.entries));
    } catch (error) {
      console.error('Error saving leaderboard:', error);
    }
  },
  
  // Get leaderboard entries
  getEntries: (): LeaderboardEntry[] => {
    return [...leaderboardState.entries];
  },
  
  // Subscribe to changes
  subscribe: (listener: () => void) => {
    leaderboardState.listeners.push(listener);
    return () => {
      leaderboardState.listeners = leaderboardState.listeners.filter(l => l !== listener);
    };
  },
  
  // Notify all listeners
  notifyListeners: () => {
    leaderboardState.listeners.forEach(listener => listener());
  },
  
  // Update username in all leaderboard entries
  updateUsernameInLeaderboard: (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    let updated = false;
    leaderboardState.entries = leaderboardState.entries.map(entry => {
      if (entry.name === oldName) {
        updated = true;
        return { ...entry, name: newName };
      }
      return entry;
    });
    
    if (updated) {
      leaderboardState.saveToLocalStorage();
      leaderboardState.notifyListeners();
    }
  }
};

// Initialize on import
leaderboardState.init(); 