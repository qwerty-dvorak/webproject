import React, { useEffect } from "react";
import "../Game.css";
import { sfxState } from "../stores/sfxState";

interface PauseMenuProps {
  onResume: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onMainMenu,
}) => {
  // Initialize sfx
  useEffect(() => {
    sfxState.initSfx();
  }, []);

  // Add keyboard listener for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playAndAct(onResume);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onResume]);

  // Helper to play sound and then trigger action
  const playAndAct = (action: () => void) => {
    sfxState.playSfx("menuSelect");
    action();
  };

  return (
    <div
      className="game-ui-container"
      style={{ position: "absolute", top: 0, left: 0, zIndex: 100 }}
    >
      <h2 className="title">Paused</h2>
      <div className="menu-buttons">
        <button className="btn" onClick={() => playAndAct(onResume)}>
          Resume
        </button>
        <button className="btn" onClick={() => playAndAct(onMainMenu)}>
          Main Menu
        </button>
      </div>
      <div className="menu-content">
        <p>Press ESC to resume</p>
      </div>
    </div>
  );
};
