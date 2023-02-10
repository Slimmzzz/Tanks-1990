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
  x: number
  y: number
  startDirection: string
  isEnemy: boolean
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
};

// TYPES
export type LevelMapEntity = string[];
export type direction = 'left' | 'right' | 'up' | 'down';