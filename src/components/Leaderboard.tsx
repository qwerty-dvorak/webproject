import React, { useState, useEffect } from 'react';
import { leaderboardState, LeaderboardEntry } from '../stores/leaderboard';
import '../Game.css';

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  // Load leaderboard data
  useEffect(() => {
    const unsubscribe = leaderboardState.subscribe(() => {
      setEntries(leaderboardState.getEntries());
    });

    // Load initial data
    setEntries(leaderboardState.getEntries());

    return unsubscribe;
  }, []);

  return (
    <div className="menu-container">
      <h2 className="title">Leaderboard</h2>
      
      <div className="leaderboard-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={`leaderboard-entry-${entry.rank}`}>
                <td>{entry.rank}</td>
                <td>{entry.name}</td>
                <td>{entry.score}</td>
                <td>{entry.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="menu-buttons">
        <button className="btn" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}; 