import React, { useState, useEffect, useRef } from 'react';
import { sfxState } from '../stores/sfxState';
import '../Game.css';

interface NameInputDialogProps {
  onSubmit: (name: string) => void;
}

export const NameInputDialog: React.FC<NameInputDialogProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
//   const [cursorVisible, setCursorVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);


  // Auto focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      sfxState.playSfx('menuSelect');
      onSubmit(name.trim());
    }
  };

  const handleKeyDown = () => {
    sfxState.playSfx('keyType');
  };

  return (
    <div className="name-input-overlay">
      <div className="name-input-dialog">
        <h2 className="name-input-title">ENTER YOUR NAME</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="name-input-container">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={10}
              className="name-input"
              autoFocus
            />
          </div>
          
          <p className="name-input-instructions">MAX 10 CHARACTERS</p>
          
          <button 
            type="submit" 
            className="btn name-submit-btn"
            onClick={() => sfxState.playSfx('menuSelect')}
            disabled={!name.trim()}
          >
            START
          </button>
        </form>
      </div>
    </div>
  );
}; 