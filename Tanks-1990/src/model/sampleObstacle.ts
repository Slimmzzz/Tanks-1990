// @ts-ignore
import Renderer from "./Renderer.ts";

type LevelMapEntity = string[];

interface ObstacleOptions {
  id: number
  x: number
  y: number
  type: string
}

export class SampleObstacle {
  renderer: Renderer
  x: number
  y: number
  width: number = 32
  height: number = 32
  isBreakable: boolean = false
  canPassThrough: boolean = false
  canShootThrough: boolean = false
  spriteX: number = 0
  spriteY: number = 0
  _pingRendererTimeoutCallback: () => void
  timeoutID: number = 0
  moveStoppers: MoveStoppers

  constructor(obstacleOptions: ObstacleOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.x = obstacleOptions.x * 32;
    this.y = obstacleOptions.y * 32;
    this.moveStoppers = {
      fromLeft: new Array(32).fill(0).map((_, i) => {
        return [this.x, this.y + i];
      }),
      fromRight: new Array(32).fill(0).map((_, i) => {
        return [this.x + this.width, this.y + i];
      }),
      fromTop: new Array(32).fill(0).map((_, i) => {
        return [this.x + i, this.y];
      }),
      fromBottom: new Array(32).fill(0).map((_, i) => {
        return [this.x + i, this.y + this.height];
      }),
    }
    switch(obstacleOptions.type) {
      case 'b': // b - brick
        this.isBreakable = true;
        this.spriteX = 1052;
        this.spriteY = 256;
        break;
      case 'a': // a - armored wall
        this.spriteX = 1052;
        this.spriteY = 288;
        break;
      case 'f': // f - forest/ kusty
        this.spriteX = 1084;
        this.spriteY = 288;
        this.canPassThrough = true;
        this.canShootThrough = true;
        break;
    }
    this._pingRendererTimeoutCallback = () => {
      this.renderer.add({
        spriteX: this.spriteX,
        spriteY: this.spriteY,
        spriteWidth: this.width,
        spriteHeight: this.height,
        canvasX: this.x,
        canvasY: this.y
      });
      this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
      // if (this.isAlive) {
      // }
    }
    this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
  }
  
  collisionBullet() {};

  collisionMove() {};
}

export class ObstacleCollection {
  renderer: Renderer
  _obstacles: {} = {}
  map: LevelMapEntity[]
  nextObstacleID: number = 1
  moveStoppers: MoveStoppers

  constructor(renderer: Renderer, map?: LevelMapEntity[]) {
    this.renderer = renderer;
    this.map = map || [[]];
    this.moveStoppers = {
      fromLeft: [],
      fromRight: [],
      fromBottom: [],
      fromTop: [],
    }
    if (this.map.length > 1 && this.map[0].length) {
      this.generateLevel();
    }
  }

  private updateMoveStoppers(obstacles: SampleObstacle[], isObstacleRemoved?: boolean) {
    if (isObstacleRemoved) {
      this.moveStoppers.fromLeft = [];
      this.moveStoppers.fromRight = [];
      this.moveStoppers.fromBottom = [];
      this.moveStoppers.fromTop = [];
    }

    for (let obstacle of obstacles) {
      this.moveStoppers.fromLeft = this.moveStoppers.fromLeft.concat(obstacle.moveStoppers.fromLeft);
      this.moveStoppers.fromRight = this.moveStoppers.fromRight.concat(obstacle.moveStoppers.fromRight);
      this.moveStoppers.fromBottom = this.moveStoppers.fromBottom.concat(obstacle.moveStoppers.fromBottom);
      this.moveStoppers.fromTop = this.moveStoppers.fromTop.concat(obstacle.moveStoppers.fromTop);
    }

    this.renderer.moveStoppers = this.moveStoppers;
  }

  create(x: number, y: number, type: string) {
    const options: ObstacleOptions = {
      id: this.nextObstacleID,
      x: x,
      y: y,
      type: type
    }
    const obstacle = new SampleObstacle(options, this.renderer);
    this.nextObstacleID += 1;
    this.updateMoveStoppers([obstacle]);

    Object.defineProperty(this._obstacles, `${options.id}`, {
      value: obstacle,
      enumerable: true,
      configurable: true
    });
  }

  generateLevel() {
    for (let i = 0; i < this.map.length; i++) {
      const row = this.map[i];
      for (let j = 0; j < row.length; j++) {
        if (!!row[j]) {
          this.create(j, i, row[j]);
        }
      }
    }
  }
}

export interface MoveStoppers {
  fromLeft: number[][]
  fromRight: number[][]
  fromBottom: number[][]
  fromTop: number[][]
}