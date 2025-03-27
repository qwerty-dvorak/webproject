// Theme constants
export type ThemeType = 'default' | 'neon' | 'retro';

export interface ThemeColors {
  player: string;
  playerGun: string;
  grass: string;
  tree: {
    trunk: string;
    foliage: string;
  };
  tankOptions: string[];
}

// Define color schemes for each theme
export const themes: Record<ThemeType, ThemeColors> = {
  default: {
    player: '#ffffff', // White
    playerGun: '#f0619a', // Pink
    grass: '#baf455', // Light green
    tree: {
      trunk: '#4d2926', // Brown
      foliage: '#7aa21d', // Green
    },
    tankOptions: ['#a52523', '#bdb638', '#78b14b'], // Red, Yellow, Green
  },
  neon: {
    player: '#00ffff', // Cyan
    playerGun: '#ff00ff', // Magenta
    grass: '#00ff99', // Bright green
    tree: {
      trunk: '#ff6600', // Neon orange
      foliage: '#33ff33', // Bright green
    },
    tankOptions: ['#ff0099', '#00ffff', '#ffff00'], // Pink, Cyan, Yellow
  },
  retro: {
    player: '#c0c0c0', // Silver
    playerGun: '#800080', // Purple
    grass: '#228b22', // Forest green
    tree: {
      trunk: '#8b4513', // Saddle brown
      foliage: '#556b2f', // Dark olive green
    },
    tankOptions: ['#8b0000', '#4682b4', '#cd853f'], // Dark red, Steel blue, Peru
  },
};

// Theme names for display
export const themeNames: Record<ThemeType, string> = {
  default: 'Default',
  neon: 'Neon',
  retro: 'Retro'
};

// Define theme IDs for easy navigation
export const themeIds: ThemeType[] = ['default', 'neon', 'retro'];

// Create a theme state store with subscribers
class ThemeStore {
  private currentTheme: ThemeType;
  private subscribers: Array<(theme: ThemeType) => void> = [];
  
  constructor() {
    // Load from localStorage or default to 'default'
    const savedTheme = localStorage.getItem('gameTheme');
    this.currentTheme = (savedTheme as ThemeType) || 'default';
  }
  
  getCurrentTheme(): ThemeType {
    return this.currentTheme;
  }
  
  getThemeColors(): ThemeColors {
    return themes[this.currentTheme];
  }
  
  setTheme(theme: ThemeType): void {
    this.currentTheme = theme;
    localStorage.setItem('gameTheme', theme);
    
    // Notify subscribers of the theme change
    this.subscribers.forEach(callback => callback(theme));
    
    // Also dispatch a DOM event for components that use it
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  }
  
  // Get a random tank color from the current theme
  getRandomTankColor(): string {
    const colors = themes[this.currentTheme].tankOptions;
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Subscribe to theme changes
  subscribe(callback: (theme: ThemeType) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
}

export const themeStore = new ThemeStore(); 