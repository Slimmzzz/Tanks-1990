// INTERFACES
export interface KeyCallbackMap {
  [key: string]: () => void
};

export interface DrawOptions {
  spriteX: number
  spriteY: number
  spriteWidth: number
  spriteHeight: number
  canvasX: number
  canvasY: number
  canvasWidth?: number
  canvasHeight?: number
  isUnderLayer?: boolean
};

export interface ObstacleOptions {
  id: number
  x: number
  y: number
  type: string
};

export interface TankOptions {
  id: number
  x: number
  y: number
  startDirection: string
  isEnemy: boolean
  hp?: number
  killScore?: number
  tankType?: string
  tankColor?: string
  tankModelWidth?: number
  tankModelHeight?: number
  ignoreAIBehaviour?: boolean
  speed?: number
};

export interface TankBlockedMoves {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
};

export interface Coords {
  x: number
  y: number
  width?: number
  height?: number
};

// TYPES
export type LevelMapEntity = string[];
export type direction = 'left' | 'right' | 'up' | 'down';
export type dynamicObjectsKey = 'tanks' | 'bullets' | 'pickups';