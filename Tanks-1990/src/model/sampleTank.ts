// @ts-ignore
import Renderer from "./Renderer.ts";

interface TankOptions {
  x: number
  y: number
  startDirection: string
  isEnemy: boolean
}

export default class SampleTank {
  dx: number
  dy: number
  tankWidth: number = 65
  tankHeight: number = 64
  spriteX: number = 0
  spriteY: number = 0
  renderer: Renderer
  _pingRendererTimeoutCallback: () => void
  timeoutID: number = 0
  isAlive: boolean = true
  _isMoving: boolean = false
  moveTimeoutID: number = 0
  isEnemy: boolean
  enemyMoveDirection: string | undefined

  constructor(tankOptions: TankOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.dx = tankOptions.x;
    this.dy = tankOptions.y;
    this.isEnemy = tankOptions.isEnemy;
    switch (tankOptions.startDirection) {
      case 'up': this.spriteX = 0; break;
      case 'down': this.spriteX = this.tankWidth * 4; break;
      case 'right': this.spriteX = this.tankWidth * 6; break;
      case 'left': this.spriteX = this.tankWidth * 2; break;
    }
    this._pingRendererTimeoutCallback = () => {
      this.renderer.add({
        spriteX: this.spriteX,
        spriteY: this.spriteY,
        spriteWidth: this.tankWidth,
        spriteHeight: this.tankHeight,
        canvasX: this.dx,
        canvasY: this.dy
      });
      if (this.isAlive) {
        this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
      }
    }
    this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
    if (this.isEnemy) {
      this.initEnemyBehavior();
    }
  }

  get isMoving() {
    return this._isMoving;
  }

  set isMoving(isMoveKeyPressed: boolean) {
    this._isMoving = isMoveKeyPressed;
  }

  move(direction: string) {
    switch (direction) {
      case 'right': this.dx += 1; this.spriteX = this.tankWidth * 6; break;
      case 'left': this.dx -= 1; this.spriteX = this.tankWidth * 2; break;
      case 'up': this.dy -= 1; this.spriteX = 0; break;
      case 'down': this.dy += 1; this.spriteX = this.tankWidth * 4; break;
    }
    if (this._isMoving) {
      this.moveTimeoutID = setTimeout(() => {
        this.move(direction);
      }, 16)
    }
  }

  stop() {
    if (!this._isMoving) {
      clearTimeout(this.moveTimeoutID);
    }
  }

  initEnemyBehavior() {
    //sample
    
    this.enemyMoveDirection = this.dx < 15 ? 'right' : 'left';
    const enemyMoveTimeoutCallback = () => {
      if (this.dx < 15) {
        this.enemyMoveDirection = 'right';
      } else if (this.dx > 100) {
        this.enemyMoveDirection = 'left';
      }
      this.isMoving = true;
      this.move(this.enemyMoveDirection!);
      this.isMoving = false;
      this.stop();
      setTimeout(enemyMoveTimeoutCallback, 16);
    };
    setTimeout(enemyMoveTimeoutCallback, 16);
  }
}