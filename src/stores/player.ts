import type { MoveDirection } from "../types";
import { endsUpInValidPosition } from "../utilities/endsUpInValidPosition";
import useMapStore from "./map"
import { state as scoreState } from "./score";
import { sfxState } from "./sfxState";

// State is exported directly so it persists between component mounts
export const state: {
  currentRow: number;
  currentTile: number;
  movesQueue: MoveDirection[];
  cameraDirection: number; // Always 0 = forward (static camera)
  shouldForcePositionUpdate: boolean; // Flag to signal immediate position update
  lastRowChangeTime: number; // Track when the player last changed rows
} = {
  currentRow: 0,
  currentTile: 0,
  movesQueue: [],
  cameraDirection: 0, // Static - we only use this for player rotation, not camera
  shouldForcePositionUpdate: false,
  lastRowChangeTime: 0
};

export function queueMove(direction: MoveDirection) {
  // With a static camera, the direction is absolute
  const isValidMove = endsUpInValidPosition(
    { rowIndex: state.currentRow, tileIndex: state.currentTile },
    [...state.movesQueue, direction]
  );

  if (!isValidMove) return;

  // Play jump sound effect
  sfxState.playSfx('jump');
  
  state.movesQueue.push(direction);
}

export function stepCompleted() {
  const direction = state.movesQueue.shift();
  const previousRow = state.currentRow;

  if (direction === "forward") {
    state.currentRow += 1;
    // Only update score when moving forward to a new max row
    scoreState.updateMaxRow(state.currentRow);
  }
  if (direction === "backward") state.currentRow -= 1;
  if (direction === "left") state.currentTile -= 1;
  if (direction === "right") state.currentTile += 1;

  // Update lastRowChangeTime if row changed
  if (previousRow !== state.currentRow) {
    state.lastRowChangeTime = Date.now();
  }

  if (state.currentRow === useMapStore.getState().rows.length - 10) {
    useMapStore.getState().addRows();
  }
}


// Reset player to default state
export function resetPlayer() {
  state.currentRow = 0;
  state.currentTile = 0;
  state.movesQueue = [];
  state.cameraDirection = 0;
  state.lastRowChangeTime = Date.now(); // Reset the row change time
}

// New function to initialize player position with immediate visual update
export function initializePlayerPosition() {
  // Reset core player state
  state.currentRow = 0;
  state.currentTile = 0;
  state.movesQueue = [];
  state.cameraDirection = 0;
  state.lastRowChangeTime = Date.now(); // Reset the row change time
  
  // Set flag to force position update on next animation frame
  state.shouldForcePositionUpdate = true;
}