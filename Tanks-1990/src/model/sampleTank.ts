// @ts-ignore
import { Coords, direction, TankBlockedMoves, TankOptions } from "../interfaces.ts";
// @ts-ignore
import Renderer from "./Renderer.ts";
// @ts-ignore
import { Obstacle } from "./sampleObstacle.ts";
// @ts-ignore
import { spriteMap } from "../view/sprite.ts";
// @ts-ignore
import { KeyController } from "../controller/KeyController.ts";
// @ts-ignore
import { Bullet } from "./Bullet.ts";
// @ts-ignore
import enemyBehaviour from './ai.ts';
// @ts-ignore
import { collidesWithCanvasBoundaries, collidesWithObstacles } from "./helpers.ts";


export default class Tank {
  id: number
  dx: number
  dy: number
  width: number = 50
  height: number = 50
  spriteX: number = 0
  spriteY: number = 0
  spriteWidth: number = 52
  spriteHeight: number = 52
  renderer: Renderer
  timeoutID: number = 0
  isAlive: boolean = true
  _isMoving: boolean = false
  moveTimeoutID: number = 0
  isEnemy: boolean
  enemyMoveDirection: string | undefined
  isOnIce: boolean = false
  direction: direction
  ignoreKeyboard: boolean = false
  ignoreIce: boolean = false
  keyboardController: KeyController | null = null
  blockedMoves: TankBlockedMoves = {
    left: false,
    right: false,
    up: false,
    down: false
  }
  _pingRendererTimeoutCallback: () => void
  tankModel: {
    up1: Coords
    up2: Coords
    left1: Coords
    left2: Coords
    down1: Coords
    down2: Coords
    right1: Coords
    right2: Coords
  }
  reload: boolean = false
  hasActiveBullet: boolean = false
  shootAiTimeout: number = 0
  moveAiTimeout: number = 0


  constructor(tankOptions: TankOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.id = tankOptions.id;
    this.dx = tankOptions.x;
    this.dy = tankOptions.y;
    this.spriteWidth = tankOptions.tankModelWidth || 52;
    this.spriteHeight = tankOptions.tankModelHeight || 52;
    this.isEnemy = tankOptions.isEnemy;
    this.tankModel = spriteMap.tanks[tankOptions.tankType || 'player'][tankOptions.tankColor || 'yellow'];
    this.direction = tankOptions.startDirection as direction;
    switch (this.direction) {
      case 'up': this.spriteX = this.tankModel.up1.x; this.spriteY = this.tankModel.up1.y; break;
      case 'down': this.spriteY = this.tankModel.down1.y; this.spriteX = this.tankModel.down1.x; break;
      case 'right': this.spriteY = this.tankModel.right1.y; this.spriteX = this.tankModel.right1.x; break;
      case 'left': this.spriteY = this.tankModel.left1.y; this.spriteX = this.tankModel.left1.x; break;
    };
    this._pingRendererTimeoutCallback = () => {
      this.renderer.add({
        spriteX: this.spriteX,
        spriteY: this.spriteY,
        spriteWidth: this.spriteWidth,
        spriteHeight: this.spriteHeight,
        canvasWidth: this.width,
        canvasHeight: this.height,
        canvasX: this.dx,
        canvasY: this.dy
      });
      if (this.isAlive) {
        this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
      }
    };
    this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
    if (this.isEnemy) {
      if (!tankOptions.ignoreAIBehaviour) {
        this.initEnemyBehavior();
        const shootAiCallback = () => {
          this.shoot();
          this.shootAiTimeout = setTimeout(shootAiCallback, 1000);
        }
        shootAiCallback();
      }
    } else {
      Object.defineProperty(window, '_tank', {
        value: this,
        enumerable: true,
        configurable: true
      })
      this.initKeyController();
    }

    this.renderer.tanks.push(this);
  }

  initEnemyBehavior() {
    enemyBehaviour(this);
  }

  get isMoving() {
    return this._isMoving;
  }

  set isMoving(isMoveKeyPressed: boolean) {
    this._isMoving = isMoveKeyPressed;
  }

  checkCollisions(direction: direction, checkCollisionsWithTanks: boolean = true) {
    
    // Collision with canvas boundries
    if (collidesWithCanvasBoundaries(this, direction)) {
      return false;
    }

    // Collisions with tanks
    if (checkCollisionsWithTanks) {
      let collidesWithTank = false;
      for (const tank of this.renderer.tanks) {
        if (tank.id !== this.id) {
          if (direction === 'up') {
            if (this.dy === tank.dy + tank.height + 1) {
              if (this.dx === tank.dx || (this.dx > tank.dx &&
                this.dx < tank.dx + tank.width) ||
                (this.dx + this.width > tank.dx &&
                  this.dx + this.width < tank.dx + tank.width)
                ) {
                collidesWithTank = true;
                break;
              }
            }
          } else if (direction === 'down') {
            if (this.dy + this.height === tank.dy - 1) {
              if (
                this.dx === tank.dx ||
                (this.dx > tank.dx &&
                  this.dx < tank.dx + tank.width) ||
                  (this.dx + this.width > tank.dx &&
                    this.dx + this.width < tank.dx + tank.width)  
              ) {
                collidesWithTank = true;
                break;
              }
            }
          } else if (direction === 'left') {
            if (this.dx === tank.dx + tank.width + 1) {
              if (
                this.dy === tank.dy ||
                (this.dy > tank.dy &&
                  this.dy < tank.dy + tank.height) ||
                (this.dy + this.height > tank.dy &&
                  this.dy + this.height < tank.dy + tank.height)
              ) {
                collidesWithTank = true; 
                break;
              }
            }
          } else if (direction === 'right') {
            if (this.dx + this.width === tank.dx - 1) {
              if (
                this.dy === tank.dy ||
                (this.dy > tank.dy &&
                  this.dy < tank.dy + tank.height) ||
                (this.dy + this.height > tank.dy &&
                  this.dy + this.height < tank.dy + tank.height)
              ) {
                collidesWithTank = true; 
                break;
              }
            }
          }
        }
      }
      // console.log(collidesWithTank);
      if (collidesWithTank) {
        return false;
      }
    }
    
    // Collision with obstacles

    let maybeObstacles = collidesWithObstacles(this, direction);
    
    if (Array.isArray(maybeObstacles) && maybeObstacles.length) {
      if (maybeObstacles.some(obstacle => !obstacle.canPassThrough)) {
        return false;
      }
      if (maybeObstacles.length > 1 && maybeObstacles.every(obstacle => obstacle.type === 'i')) {
        if (!this.ignoreIce) {
          this.ignoreKeyboard = true;
          this.ignoreIce = true;

          let i = 32;
          let iceTimeout: number | undefined;
          let iceTimeoutCallback = () => {
            this.move(direction);
            if (i) {
              iceTimeout = setTimeout(iceTimeoutCallback, 16);
              i--;
            } else {
              clearTimeout(iceTimeout);
              this.ignoreKeyboard = false;
              this.ignoreIce = false;
            }
          }
          iceTimeout = setTimeout(iceTimeoutCallback, 16);
        }
      }
    }
    return true;
  }

  move(direction: direction) {
    for (const key in this.blockedMoves) {
      if (key !== direction) {
        this.blockedMoves[key as direction] = false;
      }
    }

    const collisionCheckResult = this.checkCollisions(direction);
    if (!this.blockedMoves[direction]) {
      this._isMoving = true;
      this.shiftCallback(direction, collisionCheckResult);

      if (!collisionCheckResult) {
        this.blockedMoves[direction] = true;
        this._isMoving = false;
        return false;
      }
    } else {
      if (collisionCheckResult) {
        this.blockedMoves[direction] = false;
      }
    }
  }

  private shiftCallback(direction: direction, collisionCheckResult: boolean) {
    this.direction = direction;
    switch (direction) {
      case 'right':
        collisionCheckResult ? this.dx += 1 : this.dx -= 0;
        this.spriteX = this.spriteX === this.tankModel.right1.x ? this.tankModel.right2.x : this.tankModel.right1.x;
        this.spriteY = this.tankModel.right1.y;
        break;
      case 'left':
        collisionCheckResult ? this.dx -= 1 : this.dx += 0;
        this.spriteX = this.spriteX === this.tankModel.left1.x ? this.tankModel.left2.x : this.tankModel.left1.x;
        this.spriteY = this.tankModel.left1.y;
        break;
      case 'up':
        collisionCheckResult ? this.dy -= 1 : this.dy += 0;
        this.spriteX = this.spriteX === this.tankModel.up1.x ? this.tankModel.up2.x : this.tankModel.up1.x;
        this.spriteY = this.tankModel.up1.y;
        break;
      case 'down':
        collisionCheckResult ? this.dy += 1 : this.dy -= 0;
        this.spriteX = this.spriteX === this.tankModel.down1.x ? this.tankModel.down2.x : this.tankModel.down1.x;
        this.spriteY = this.tankModel.down1.y;
        break;
    }
  }

  stop() {
    if (!this._isMoving) {
      clearTimeout(this.moveTimeoutID);
    }
  }


  shoot() {
    if (!this.hasActiveBullet) {
      new Bullet({
        id: this.renderer.nextBulletID,
        x: this.dx, 
        y: this.dy
      }, this.renderer, this).move(this.direction);
      this.hasActiveBullet = true;
      this.renderer.nextBulletID += 1;
    }
  }

  die() {
    // TODO explosion animation
    // TODO передать в игру очки за убитый танк
    this.destroy();
  }

  destroy() {
    clearTimeout(this.moveAiTimeout);
    this.stop();
    clearTimeout(this.shootAiTimeout);
    clearTimeout(this.timeoutID);
    const tankIndex = this.renderer.tanks.findIndex((tank: Tank) => {
      return tank.id === this.id;
    });
    this.renderer.tanks.splice(tankIndex, 1);
  }

  private initKeyController() {
    const _move = (direction: direction) => {
      if (!this.ignoreKeyboard) {
        this.move(direction)
      }
    }
  
    this.keyboardController = new KeyController({
      'w': () => { _move('up'); },
      's': () => { _move('down'); },
      'a': () => { _move('left'); },
      'd': () => { _move('right'); },
    }, 16);  

    let shootController = new KeyController({
      ' ': () => { this.shoot(); }
    });
  }
}