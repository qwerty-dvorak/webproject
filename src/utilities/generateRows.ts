import * as THREE from "three";
import type { Row, RowType } from "../types";
import { minTileIndex, maxTileIndex } from "../constants";
import { themeStore } from "../stores/themeStore";
import { difficultyStore, DifficultyLevel } from "../stores/difficultyStore";

function randomElement<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

export function generateRows(count: number): Row[] {
  const difficulty = difficultyStore.getDifficulty();
  
  return Array.from({ length: count }, () => {
    const occupiedTiles = new Set<number>();

    // Difficulty-based row type probabilities
    const rowTypeChances = {
      'easy': { car: 0.3, forest: 0.7 },
      'medium': { car: 0.5, forest: 0.5 },
      'hard': { car: 0.7, forest: 0.3 }
    };
    
    const chance = Math.random();
    const carChance = rowTypeChances[difficulty].car;
    
    const type: RowType = chance < carChance ? "car" : "forest";
    
    if (type === "car") return generateCarLaneMetadata(difficulty);
    if (type === "forest") return generateForestMetadata(occupiedTiles);

    // Default case (should never happen with TypeScript)
    return generateForestMetadata(occupiedTiles);
  });
}

function generateForestMetadata(occupiedTiles: Set<number>): Row {
  const treeCount = THREE.MathUtils.randInt(3, 5);
  const trees = [];

  for (let i = 0; i < treeCount; i++) {
    let tileIndex: number;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);

    trees.push({
      tileIndex,
      height: randomElement([20, 30, 50]),
    });
  }

  return { type: "forest", trees };
}

function generateCarLaneMetadata(difficulty: DifficultyLevel = 'medium'): Row {
  const direction = randomElement([true, false]);
  
  // Speed based on difficulty
  const speedRanges = {
    'easy': { min: 60, max: 150 },
    'medium': { min: 80, max: 250 },
    'hard': { min: 120, max: 300 }
  };
  
  const speed = THREE.MathUtils.randInt(
    speedRanges[difficulty].min, 
    speedRanges[difficulty].max
  );
  
  const tileRange = maxTileIndex - minTileIndex + 1;
  
  // Vehicle count based on difficulty
  const vehicleCountRanges = {
    'easy': { min: 1, max: 2 },
    'medium': { min: 1, max: 4 },
    'hard': { min: 2, max: 6 }
  };
  
  const vehicleCount = THREE.MathUtils.randInt(
    vehicleCountRanges[difficulty].min,
    vehicleCountRanges[difficulty].max
  );
  
  // Minimum safe distance based on difficulty
  const minSafeDistances = {
    'easy': 5,
    'medium': 3,
    'hard': 2
  };
  
  const minSafeDistance = minSafeDistances[difficulty];
  
  // Generate positions
  const positions = [];
  
  // First vehicle position
  let lastPosition = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
  positions.push(lastPosition);
  
  // Add more vehicles with random spacing
  for (let i = 1; i < vehicleCount; i++) {
    // Try to place a vehicle with sufficient spacing
    let attempts = 0;
    let newPosition: number;
    
    do {
      // Random distance from last vehicle
      const spacing = THREE.MathUtils.randInt(minSafeDistance, Math.floor(tileRange / 2));
      newPosition = (lastPosition + spacing) % tileRange + minTileIndex;
      attempts++;
      
      // Avoid infinite loops
      if (attempts > 10) break;
    } while (positions.some(pos => Math.abs(pos - newPosition) < minSafeDistance));
    
    // If found valid position, add it
    if (attempts <= 10) {
      positions.push(newPosition);
      lastPosition = newPosition;
    }
  }

  const vehicles = positions.map(initialTileIndex => {
    const color = themeStore.getRandomTankColor();
    return { initialTileIndex, color };
  });

  return { type: "car", direction, speed, vehicles };
}
