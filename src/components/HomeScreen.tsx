import React, { useState, useEffect } from "react";
import { gameState, HomeSubScreen } from "../stores/gameState";
import { AudioControls } from "./AudioControls";
import { sfxState } from "../stores/sfxState";
import { Leaderboard } from "./Leaderboard";
import { NameInputDialog } from "./NameInputDialog";
import { leaderboardState } from "../stores/leaderboard";
import "../Game.css";
import {
  themeStore,
  ThemeType,
  themeNames,
  themeIds,
} from "../stores/themeStore";
import { difficultyStore, DifficultyLevel } from "../stores/difficultyStore";

interface HomeScreenProps {
  onStartGame: () => void;
  currentSubScreen: HomeSubScreen;
}

// Helper function to play sound effect and perform action
const playAndAct = (sound: "menuSelect" | "gameStart", action: () => void) => {
  sfxState.playSfx(sound);
  action();
};

const MainMenu: React.FC<{ onStartGame: () => void }> = ({ onStartGame }) => {
  const [showNameInput, setShowNameInput] = useState(false);

  // Check if name input is needed
  const handleStartClick = () => {
    if (leaderboardState.needsPlayerName()) {
      setShowNameInput(true);
      sfxState.playSfx("menuSelect");
    } else {
      playAndAct("gameStart", onStartGame);
    }
  };

  // Handle name submission
  const handleNameSubmit = (name: string) => {
    leaderboardState.setPlayerName(name);
    setShowNameInput(false);
    playAndAct("gameStart", onStartGame);
  };

  return (
    <>
      <h1 className="title" style={{ color: "orange", fontSize: "60px" }}>
      Smash and Dash
      </h1>
      <div className="menu-buttons">
        <button className="btn" onClick={handleStartClick}>
          Start Game
        </button>
        <button
          className="btn"
          onClick={() =>
            playAndAct("menuSelect", () =>
              gameState.setHomeSubScreen("leaderboard")
            )
          }
        >
          Leaderboard
        </button>
        <button
          className="btn"
          onClick={() =>
            playAndAct("menuSelect", () =>
              gameState.setHomeSubScreen("settings")
            )
          }
        >
          Settings
        </button>
        <button
          className="btn"
          onClick={() =>
            playAndAct("menuSelect", () =>
              gameState.setHomeSubScreen("credits")
            )
          }
        >
          Credits
        </button>
      </div>
      <div className="game-instructions">
        <p>Use arrow keys or buttons to move</p>
        <p>Avoid obstacles and reach as far as you can!</p>
      </div>

      {showNameInput && <NameInputDialog onSubmit={handleNameSubmit} />}
    </>
  );
};

const SettingsMenu: React.FC = () => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(
    leaderboardState.playerName || "-"
  );
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(
    (localStorage.getItem("gameTheme") as ThemeType) || "default"
  );
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>(
    difficultyStore.getDifficulty()
  );

  useEffect(() => {
    // Update name when leaderboard state changes
    const unsubscribe = leaderboardState.subscribe(() => {
      setCurrentUsername(leaderboardState.playerName || "-");
    });

    // Update current theme when theme store changes
    const unsubscribeTheme = themeStore.subscribe((theme) => {
      setCurrentTheme(theme);
    });

    // Update difficulty when difficulty store changes
    const unsubscribeDifficulty = difficultyStore.subscribe((difficulty) => {
      setCurrentDifficulty(difficulty);
    });

    return () => {
      unsubscribe();
      unsubscribeTheme();
      unsubscribeDifficulty();
    };
  }, []);

  const handleNameChange = (name: string) => {
    const oldName = leaderboardState.playerName;
    leaderboardState.setPlayerName(name);
    leaderboardState.updateUsernameInLeaderboard(oldName, name);
    setIsEditingName(false);
  };

  // Get current theme index
  const currentThemeIndex = themeIds.indexOf(currentTheme);

  // Handle theme navigation
  const navigateTheme = (direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? (currentThemeIndex + 1) % themeIds.length
        : (currentThemeIndex - 1 + themeIds.length) % themeIds.length;

    const newTheme = themeIds[newIndex];
    themeStore.setTheme(newTheme);

    // Play a menu selection sound
    sfxState.playSfx("menuSelect");
  };

  // Handle difficulty navigation
  const navigateDifficulty = (direction: "prev" | "next") => {
    const difficulties: DifficultyLevel[] = ["easy", "medium", "hard"];
    const currentIndex = difficulties.indexOf(currentDifficulty);
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % difficulties.length
        : (currentIndex - 1 + difficulties.length) % difficulties.length;

    difficultyStore.setDifficulty(difficulties[newIndex]);
    sfxState.playSfx("menuSelect");
  };

  // Difficulty display names
  const difficultyNames = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };

  return (
    <>
      <h1 className="title">Settings</h1>

      <div className="settings-container">
        <div className="settings-column">
          <h2 className="settings-section-title">Audio Settings</h2>
          <AudioControls />
        </div>

        <div className="settings-column">
          <h2 className="settings-section-title">User Settings</h2>
          <div className="user-settings-section">
            <div className="user-info-content">
              <h3 className="audio-section-title">Current Player</h3>
              {isEditingName ? (
                <NameInputDialog onSubmit={handleNameChange} />
              ) : (
                <div className="username-display">
                  <div className="player-name">{currentUsername}</div>
                  <button
                    className="edit-name-btn"
                    onClick={() => {
                      sfxState.playSfx("menuSelect");
                      setIsEditingName(true);
                    }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div className="theme-content">
              <h3 className="audio-section-title">Visual Style</h3>
              <div className="track-carousel">
                <button
                  className="carousel-btn prev-btn"
                  onClick={() => navigateTheme("prev")}
                  aria-label="Previous theme"
                >
                  ◀
                </button>

                <div className="current-track">
                  <div className="track-name">{themeNames[currentTheme]}</div>
                </div>

                <button
                  className="carousel-btn next-btn"
                  onClick={() => navigateTheme("next")}
                  aria-label="Next theme"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Add difficulty settings */}
            <div className="difficulty-content">
              <h3 className="audio-section-title">Difficulty</h3>
              <div className="track-carousel">
                <button
                  className="carousel-btn prev-btn"
                  onClick={() => navigateDifficulty("prev")}
                  aria-label="Previous difficulty"
                >
                  ◀
                </button>

                <div className="current-track">
                  <div className="track-name">
                    {difficultyNames[currentDifficulty]}
                  </div>
                </div>

                <button
                  className="carousel-btn next-btn"
                  onClick={() => navigateDifficulty("next")}
                  aria-label="Next difficulty"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="menu-buttons">
        <button
          className="btn"
          onClick={() =>
            playAndAct("menuSelect", () => gameState.setHomeSubScreen("main"))
          }
        >
          Back
        </button>
      </div>
    </>
  );
};

const CreditsMenu: React.FC = () => (
  <>
    <h1 className="title">Credits</h1>
    <div className="credits-container">
      <div className="credits-header">
        <p className="credits-game-title">Smash and Dash</p>
        <p className="credits-tagline">
          A retro-style tank game created with React and Three.js
        </p>
      </div>

      <div className="credits-team">
        <div className="credit-person">
          <div className="pixel-avatar jane"></div>
          <h3 className="credit-name">Jane</h3>
          <p className="credit-role">Music & Sound Effects</p>
          <p className="credit-description">
            Created the chiptune soundtrack and all the retro sound effects
          </p>
        </div>

        <div className="credit-person">
          <div className="pixel-avatar john"></div>
          <h3 className="credit-name">John</h3>
          <p className="credit-role">Asset Design</p>
          <p className="credit-description">
            Designed all pixel art, textures, and visual elements
          </p>
        </div>

        <div className="credit-person">
          <div className="pixel-avatar jake"></div>
          <h3 className="credit-name">Jake</h3>
          <p className="credit-role">Gameplay Programming</p>
          <p className="credit-description">
            Programmed game mechanics and physics
          </p>
        </div>
      </div>

      <div className="credits-footer">
        <p>© 2025 Pixel Games Studios</p>
        <p>Thanks for playing!</p>
      </div>
    </div>

    <div className="menu-buttons">
      <button
        className="btn"
        onClick={() =>
          playAndAct("menuSelect", () => gameState.setHomeSubScreen("main"))
        }
      >
        Back
      </button>
    </div>
  </>
);

const LeaderboardMenu: React.FC = () => (
  <Leaderboard
    onBack={() =>
      playAndAct("menuSelect", () => gameState.setHomeSubScreen("main"))
    }
  />
);

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  currentSubScreen,
}) => {
  // Initialize sfx
  useEffect(() => {
    sfxState.initSfx();
  }, []);

  return (
    <div className="game-ui-container">
      {currentSubScreen === "main" && <MainMenu onStartGame={onStartGame} />}
      {currentSubScreen === "settings" && <SettingsMenu />}
      {currentSubScreen === "credits" && <CreditsMenu />}
      {currentSubScreen === "leaderboard" && <LeaderboardMenu />}
    </div>
  );
};
