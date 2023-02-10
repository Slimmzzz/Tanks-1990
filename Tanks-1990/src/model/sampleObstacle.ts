// @ts-ignore
import { ObstacleOptions, LevelMapEntity } from "../interfaces.ts";
// @ts-ignore
import { spriteMap } from "../view/sprite.ts";
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
  type: string
  isBreakable: boolean = false
  canPassThrough: boolean = false
  canShootThrough: boolean = false
  isUnderLayer: boolean = false
  spriteX: number = 0
  spriteY: number = 0
  _pingRendererTimeoutCallback: () => void
  timeoutID: number = 0

  constructor(obstacleOptions: ObstacleOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.x = obstacleOptions.x * 32;
    this.y = obstacleOptions.y * 32;
    this.type = obstacleOptions.type;
    switch(this.type) {
      case 'b': // b - brick
        this.isBreakable = true;
        this.spriteX = spriteMap.obstacles.b.x;
        this.spriteY = spriteMap.obstacles.b.y;
        break;
      case 'a': // a - armored wall
        this.spriteX = spriteMap.obstacles.a.x;
        this.spriteY = spriteMap.obstacles.a.y;
        break;
      case 'f': // f - forest/ kusty
        this.spriteX = spriteMap.obstacles.f.x;
        this.spriteY = spriteMap.obstacles.f.y;
        this.canPassThrough = true;
        this.canShootThrough = true;
        break;
      case 'i': // i - ice
        this.spriteX = spriteMap.obstacles.i.x;
        this.spriteY = spriteMap.obstacles.i.y;
        this.canPassThrough = true;
        this.canShootThrough = true;
        this.isUnderLayer = true;
        break;
      case 'w': // w - water
        this.spriteX = spriteMap.obstacles.w.w1.x;
        this.spriteY = spriteMap.obstacles.w.w1.y;
        this.canShootThrough = true;
        this.initWaterAnimation();
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
    }
    this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
  }
  
  initWaterAnimation() {
    let i = 1;
    const animationTimeoutCallback = () => {
      this.spriteX = spriteMap.obstacles.w[`w${i}`].x;
      this.spriteY = spriteMap.obstacles.w[`w${i}`].y;
      if (i === 2) {
        i = 1;
      } else {
        i++;
      }
      setTimeout(animationTimeoutCallback, 640);
    }
    setTimeout(animationTimeoutCallback, 640);
  };

  collisionBullet() {};

  collisionMove() {};
}

export class ObstacleCollection {
  renderer: Renderer
  _obstacles: {} = {}
  map: LevelMapEntity[]
  nextObstacleID: number = 1
  realMap: (SampleObstacle | null)[][] = []

  constructor(renderer: Renderer, map?: LevelMapEntity[]) {
    this.renderer = renderer;
    this.map = map || [[]];
    if (this.map.length > 1 && this.map[0].length) {
      this.generateLevel();
      this.renderer.obstacleCoordsMatrix = this.realMap;
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
    return obstacle;
  }

  generateLevel() {
    for (let i = 0; i < this.map.length; i++) {
      this.realMap.push([]);
      const row = this.map[i];
      for (let j = 0; j < row.length; j++) {
        if (!!row[j]) {
          this.realMap[i].push(this.create(j, i, row[j]))
        } else {
          this.realMap[i].push(null);
        }
      }
    }
  }
}