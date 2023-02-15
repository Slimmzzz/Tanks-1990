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


export default class Tank {
  id: number
  dx: number
  dy: number
  tankWidth: number = 50
  tankHeight: number = 50
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
        canvasWidth: this.tankWidth,
        canvasHeight: this.tankHeight,
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
    if ((this.dx < 0 && direction === 'left')
    || (this.dx > this.renderer.canvas.width - this.tankWidth && direction === 'right') 
    || (this.dy < 0 && direction === 'up')
    || (this.dy >= this.renderer.canvas.height - this.tankHeight && direction === 'down')
    ) {
      return false;
    }

    // Collisions with tanks
    if (checkCollisionsWithTanks) {
      let collidesWithTank = false;
      for (const tank of this.renderer.tanks) {
        if (tank.id !== this.id) {
          if (direction === 'up') {
            if (this.dy === tank.dy + tank.tankHeight + 1) {
              if (this.dx === tank.dx || (this.dx > tank.dx &&
                this.dx < tank.dx + tank.tankWidth) ||
                (this.dx + this.tankWidth > tank.dx &&
                  this.dx + this.tankWidth < tank.dx + tank.tankWidth)
                ) {
                collidesWithTank = true;
                break;
              }
            }
          } else if (direction === 'down') {
            if (this.dy + tank.tankHeight > tank.dy - 1) {
              if (
                this.dx === tank.dx ||
                (this.dx > tank.dx &&
                  this.dx < tank.dx + tank.tankWidth) ||
                  (this.dx + this.tankWidth > tank.dx &&
                    this.dx + this.tankWidth < tank.dx + tank.tankWidth)  
              ) {
                collidesWithTank = true;
                break;
              }
            }
          } else if (direction === 'left') {
            if (this.dx === tank.dx + tank.tankWidth + 1) {
              if (
                this.dy === tank.dy ||
                (this.dy > tank.dy &&
                  this.dy < tank.dy + tank.tankHeight) ||
                (this.dy + this.tankHeight > tank.dy &&
                  this.dy + this.tankHeight < tank.dy + tank.tankHeight)
              ) {
                collidesWithTank = true; 
                break;
              }
            }
          } else if (direction === 'right') {
            if (this.dx + this.tankWidth === tank.dx - 1) {
              if (
                this.dy === tank.dy ||
                (this.dy > tank.dy &&
                  this.dy < tank.dy + tank.tankHeight) ||
                (this.dy + this.tankHeight > tank.dy &&
                  this.dy + this.tankHeight < tank.dy + tank.tankHeight)
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

    let maybeObstacles = [];
    const matrix = this.renderer.obstacleCoordsMatrix;
    if (direction === 'up') {
      const LookupY = Math.floor(this.dy / 32);
      const LookupXLeft = Math.floor((this.dx + 1) / 32);
      const LookupXRight = Math.floor((this.dx + this.tankWidth - 1) / 32);
      
      if (matrix[LookupY][LookupXLeft] instanceof Obstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXLeft]);
      }
      if (matrix[LookupY][LookupXRight] instanceof Obstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXRight]);
      }
      if (LookupXRight - LookupXLeft > 1) {
        if (matrix[LookupY][LookupXLeft + 1] instanceof Obstacle) {
          maybeObstacles.push(matrix[LookupY][LookupXLeft + 1]);
        }
      }
    } else if (direction === 'down') {
      const LookupY = Math.floor((this.dy + this.tankHeight) / 32);
      const LookupXLeft = Math.floor((this.dx + 1) / 32);
      const LookupXRight = Math.floor((this.dx + this.tankWidth - 1) / 32);

      if (matrix[LookupY][LookupXLeft] instanceof Obstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXLeft]);
      }
      if (matrix[LookupY][LookupXRight] instanceof Obstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXRight]);
      }
      if (LookupXRight - LookupXLeft > 1) {
        if (matrix[LookupY][LookupXLeft + 1] instanceof Obstacle) {
          maybeObstacles.push(matrix[LookupY][LookupXLeft + 1]);
        }
      }
    } else if (direction === 'left') {
      const lookupX = Math.floor(this.dx / 32);
      const lookupYUp = Math.floor((this.dy + 1) / 32);
      const lookupYDown = Math.floor((this.dy + this.tankHeight - 1) / 32);

      if (matrix[lookupYUp][lookupX] instanceof Obstacle) {
        maybeObstacles.push(matrix[lookupYUp][lookupX]);
      }
      if (matrix[lookupYDown][lookupX] instanceof Obstacle) {
        maybeObstacles.push(matrix[lookupYDown][lookupX]);
      }
      if (lookupYDown - lookupYUp > 1) {
        if (matrix[lookupYUp + 1][lookupX] instanceof Obstacle) {
          maybeObstacles.push(matrix[lookupYUp + 1][lookupX]);
        }
      }
    } else if (direction === 'right') {
      const lookupX = Math.floor((this.dx + this.tankWidth) / 32);
      const lookupYUp = Math.floor((this.dy + 1) / 32);
      const lookupYDown = Math.floor((this.dy + this.tankHeight - 1) / 32);

      if (matrix[lookupYUp][lookupX] instanceof Obstacle) {
        maybeObstacles.push(matrix[lookupYUp][lookupX]);
      }
      if (matrix[lookupYDown][lookupX] instanceof Obstacle) {
        maybeObstacles.push(matrix[lookupYDown][lookupX]);
      }
      if (lookupYDown - lookupYUp > 1) {
        if (matrix[lookupYUp + 1][lookupX] instanceof Obstacle) {
          maybeObstacles.push(matrix[lookupYUp + 1][lookupX]);
        }
      }
    }
    
    if (maybeObstacles.length) {
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
    return new Bullet({x: this.dx, y: this.dy}, this.renderer).move(this.direction)
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

    // let shootController = new KeyController({
    //   ' ': () => { this.shoot(); }
    // });
  }
}