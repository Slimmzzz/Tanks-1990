// @ts-ignore
import { ObstacleOptions, LevelMapEntity } from "../interfaces.ts";
// @ts-ignore
import Renderer from "./Renderer.ts";
// @ts-ignore
import { Coords } from "./sampleTank.ts";


export class SampleObstacle {
  renderer: Renderer
  x: number
  y: number
  width: number = 32
  height: number = 32
  isBreakable: boolean = false
  canPassThrough: boolean = false
  canShootThrough: boolean = false
  isUnderLayer: boolean = false
  spriteX: number = 0
  spriteY: number = 0
  _pingRendererTimeoutCallback: () => void
  timeoutID: number = 0
  occupiedCell: Coords

  constructor(obstacleOptions: ObstacleOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.x = obstacleOptions.x * 32;
    this.y = obstacleOptions.y * 32;
    this.occupiedCell = {x: obstacleOptions.x, y: obstacleOptions.y}
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
      case 'i': // i - ice
        this.spriteX = 1116;
        this.spriteY = 288;
        this.canPassThrough = true;
        this.canShootThrough = true;
        this.isUnderLayer = true;
        break;
      case 'w': // w - water
        this.spriteX = 1052;
        this.spriteY = 320;
        this.canShootThrough = true;
    }
    this._pingRendererTimeoutCallback = () => {
      this.renderer.add({
        spriteX: this.spriteX,
        spriteY: this.spriteY,
        spriteWidth: this.width,
        spriteHeight: this.height,
        canvasX: this.x,
        canvasY: this.y,
        isUnderLayer: this.isUnderLayer
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

  constructor(renderer: Renderer, map?: LevelMapEntity[]) {
    this.renderer = renderer;
    this.map = map || [[]];
    if (this.map.length > 1 && this.map[0].length) {
      this.generateLevel();
    }
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
    this.renderer.addObstacle(obstacle);
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