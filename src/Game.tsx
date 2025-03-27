import { useState, useEffect, useRef } from "react";
import { Scene } from "./components/Scene";
import { Player } from "./components/Player";
import { GameMap } from "./components/GameMap";
import { Controls } from "./components/Controls";
import useEventListeners from "./hooks/useEventListeners";
import { state as scoreState } from "./stores/score";
import { leaderboardState } from "./stores/leaderboard";
import { hitTest } from "./hitTest";
import { gameState } from "./stores/gameState";
import { sfxState } from "./stores/sfxState";
import { initializeGame } from "./utilities/gameInitializer";
import "./Game.css";

// Debug flag for collision detection
const DEBUG_COLLISION = false;

interface GameProps {
  onPause?: () => void;
}

export default function Game({ onPause }: GameProps) {
  // Track score for live updates
  const [score, setScore] = useState(scoreState.value);
  
  // Animation frame ref for collision detection
  const animationFrameRef = useRef<number | null>(null);
  
  // Add state to track current game screen
  const [currentScreen, setCurrentScreen] = useState(gameState.current.screen);
  
  // Debug display toggle state
  const [showDebugDisplay, setShowDebugDisplay] = useState(true);
  
  // Track game over state to play sound only once
  const gameOverSoundPlayed = useRef(false);
  
  // Track if leaderboard has been updated for this game over
  const leaderboardUpdated = useRef(false);
  
  // Track if high score has been achieved
  const [isHighScore, setIsHighScore] = useState(false);
  
  // Connect event listeners with pause handler
  useEventListeners(onPause);

  // Initialize sound effects
  useEffect(() => {
    sfxState.initSfx();
  }, []);

  // Subscribe to score changes
  useEffect(() => {
    // Subscribe to score updates
    const unsubscribe = scoreState.subscribe(() => {
      setScore(scoreState.value);
    });
    
    // Cleanup function to unsubscribe
    return unsubscribe;
  }, []);
  
  // Track game state changes
  useEffect(() => {
    const unsubscribe = gameState.subscribe((state) => {
      setCurrentScreen(state.screen);
      
      // Update leaderboard when game over
      if (state.screen === 'game-over' && !leaderboardUpdated.current) {
        leaderboardUpdated.current = true;
        
        // Add score to leaderboard
        leaderboardState.addScore(scoreState.value);
        
        // Check if new high score
        setIsHighScore(leaderboardState.isNewHighScore);
        
        // Play game over sound
        if (!gameOverSoundPlayed.current) {
          sfxState.playSfx('gameOver');
          gameOverSoundPlayed.current = true;
        }
      }
      
      // Reset the game over and leaderboard flags when not in game over screen
      if (state.screen !== 'game-over') {
        gameOverSoundPlayed.current = false;
        leaderboardUpdated.current = false;
        setIsHighScore(false);
      }
    });
    
    return unsubscribe;
  }, []);
  
  // Set up collision detection using requestAnimationFrame
  useEffect(() => {
    // Function to check for collisions each frame
    const checkCollisions = () => {
      // Run collision detection on every frame, not just in playing state
      hitTest(DEBUG_COLLISION && showDebugDisplay);
      
      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(checkCollisions);
    };
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(checkCollisions);
    
    // Cleanup function to cancel animation frame on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showDebugDisplay]);

  // Handle pause - no need to do anything special since state is stored 
  // in persistent stores that survive component unmounting
  const handlePause = () => {
    sfxState.playSfx('menuSelect');
    if (onPause) {
      // Camera state and player state are already in their respective stores
      onPause();
    }
  };
  
  // Helper to play sound and handle action
  const playAndAct = (action: () => void) => {
    sfxState.playSfx('menuSelect');
    action();
  };

  return (
    <>
      <h1 className="game-title">Pixel Tanks</h1>
      <div className="game-container">
        <div className="game">
          {onPause && currentScreen === 'playing' && (
            <button className="pause-btn" onClick={handlePause}>
              II
            </button>
          )}
          <div className="score-display">
            <span>SCORE:</span> {score}
          </div>
          {DEBUG_COLLISION && (
            <div className="debug-info" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'lime', padding: '5px', zIndex: 1000 }}>
              DEBUG MODE: Collision Detection
              <button 
                onClick={() => setShowDebugDisplay(!showDebugDisplay)}
                style={{ marginLeft: '10px', background: 'rgba(100,100,100,0.7)', border: '1px solid lime', color: 'white', cursor: 'pointer' }}
              >
                {showDebugDisplay ? 'Hide' : 'Show'} Console
              </button>
              <div style={{ fontSize: '10px', marginTop: '5px' }}>
                Check browser console for detailed collision information
              </div>
            </div>
          )}
          <Scene>
            <Player />
            <GameMap />
          </Scene>
          <Controls />
          
          {/* Game Over Dialog */}
          <div id="result-container" className={currentScreen === 'game-over' ? 'visible' : ''}>
            <div id="result">
              <h1>Game Over</h1>
              {isHighScore && (
                <div className="highscore-message">NEW HIGHSCORE!</div>
              )}
              <p>Your score: <span id="final-score">{score}</span></p>
              <div className="menu-buttons">
                <button 
                  className="btn"
                  onClick={() => playAndAct(() => initializeGame('playing'))}
                >
                  Retry
                </button>
                {/* <button 
                  className="btn"
                  onClick={() => playAndAct(() => initializeGame('home', 'leaderboard'))}
                >
                  View Leaderboard
                </button> */}
                <button 
                  className="btn"
                  onClick={() => playAndAct(() => initializeGame('home', 'main'))}
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}