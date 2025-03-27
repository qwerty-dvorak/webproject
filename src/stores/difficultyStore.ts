export type DifficultyLevel = 'easy' | 'medium' | 'hard';

type Subscriber = (difficulty: DifficultyLevel) => void;

class DifficultyStore {
  private difficulty: DifficultyLevel;
  private subscribers: Subscriber[] = [];

  constructor() {
    // Load from localStorage or default to 'medium'
    this.difficulty = (localStorage.getItem('gameDifficulty') as DifficultyLevel) || 'medium';
  }

  getDifficulty(): DifficultyLevel {
    return this.difficulty;
  }

  setDifficulty(difficulty: DifficultyLevel): void {
    this.difficulty = difficulty;
    localStorage.setItem('gameDifficulty', difficulty);
    this.notifySubscribers();
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.difficulty);
    }
  }
}

export const difficultyStore = new DifficultyStore(); 