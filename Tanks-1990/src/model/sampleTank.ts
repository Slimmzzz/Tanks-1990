// @ts-ignore
import { Coords, direction, TankBlockedMoves, TankOptions } from "../interfaces.ts";
// @ts-ignore
import Renderer from "./Renderer.ts";
// @ts-ignore
import { SampleObstacle } from "./sampleObstacle.ts";
// @ts-ignore
import { spriteMap } from "../view/sprite.ts";
// @ts-ignore
import { KeyController } from "../controller/KeyController.ts";
// @ts-ignore
import { Bullet } from "./Bullet.ts";


export default class SampleTank {
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
  reload: boolean = false


  constructor(tankOptions: TankOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.dx = tankOptions.x;
    this.dy = tankOptions.y;
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
      // this.initEnemyBehavior();
    } else {
      this.initKeyController();
    }
    Object.defineProperty(window, '_tank', {
      value: this,
      enumerable: true,
      configurable: true
    })
  }

  get isMoving() {
    return this._isMoving;
  }

  set isMoving(isMoveKeyPressed: boolean) {
    this._isMoving = isMoveKeyPressed;
  }

  checkCollisions(direction: direction) {
    // Collision with canvas boundries
    if ((this.dx < 0 && direction === 'left')
    || (this.dx > this.renderer.canvas.width - this.tankWidth && direction === 'right') 
    || (this.dy < 0 && direction === 'up')
    || (this.dy >= this.renderer.canvas.height - this.tankHeight && direction === 'down')
    ) {
      return false;
    }

    let maybeObstacles = [];
    const matrix = this.renderer.obstacleCoordsMatrix;
    if (direction === 'up') {
      const LookupY = Math.floor(this.dy / 32);
      const LookupXLeft = Math.floor((this.dx) / 32);
      const LookupXRight = Math.floor((this.dx + this.tankWidth) / 32);
      
      if (matrix[LookupY][LookupXLeft] instanceof SampleObstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXLeft]);
      }
      if (matrix[LookupY][LookupXRight] instanceof SampleObstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXRight]);
      }
      if (LookupXRight - LookupXLeft > 1) {
        if (matrix[LookupY][LookupXLeft + 1] instanceof SampleObstacle) {
          maybeObstacles.push(matrix[LookupY][LookupXLeft + 1]);
        }
      }
    } else if (direction === 'down') {
      const LookupY = Math.floor((this.dy + this.tankHeight) / 32);
      const LookupXLeft = Math.floor((this.dx) / 32);
      const LookupXRight = Math.floor((this.dx + this.tankWidth) / 32);

      if (matrix[LookupY][LookupXLeft] instanceof SampleObstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXLeft]);
      }
      if (matrix[LookupY][LookupXRight] instanceof SampleObstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXRight]);
      }
      if (LookupXRight - LookupXLeft > 1) {
        if (matrix[LookupY][LookupXLeft + 1] instanceof SampleObstacle) {
          maybeObstacles.push(matrix[LookupY][LookupXLeft + 1]);
        }
      }
    } else if (direction === 'left') {
      const lookupX = Math.floor(this.dx / 32);
      const lookupYUp = Math.floor(this.dy / 32);
      const lookupYDown = Math.floor((this.dy + this.tankHeight) / 32);

      if (matrix[lookupYUp][lookupX] instanceof SampleObstacle) {
        maybeObstacles.push(matrix[lookupYUp][lookupX]);
      }
      if (matrix[lookupYDown][lookupX] instanceof SampleObstacle) {
        maybeObstacles.push(matrix[lookupYDown][lookupX]);
      }
      if (lookupYDown - lookupYUp > 1) {
        if (matrix[lookupYUp + 1][lookupX] instanceof SampleObstacle) {
          maybeObstacles.push(matrix[lookupYUp + 1][lookupX]);
        }
      }
    } else if (direction === 'right') {
      const lookupX = Math.floor((this.dx + this.tankWidth) / 32);
      const lookupYUp = Math.floor(this.dy / 32);
      const lookupYDown = Math.floor((this.dy + this.tankHeight) / 32);

      if (matrix[lookupYUp][lookupX] instanceof SampleObstacle) {
        maybeObstacles.push(matrix[lookupYUp][lookupX]);
      }
      if (matrix[lookupYDown][lookupX] instanceof SampleObstacle) {
        maybeObstacles.push(matrix[lookupYDown][lookupX]);
      }
      if (lookupYDown - lookupYUp > 1) {
        if (matrix[lookupYUp + 1][lookupX] instanceof SampleObstacle) {
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

    if (!this.blockedMoves[direction]) {
      this._isMoving = true;
      const collisionCheckResult = this.checkCollisions(direction);
      this.shiftCallback(direction, collisionCheckResult);

      if (!collisionCheckResult) {
        this.blockedMoves[direction] = true;
        this._isMoving = false;
        return false;
      }
    }
  }

  private shiftCallback(direction: direction, collisionCheckResult: boolean) {
    this.direction = direction;
    switch (direction) {
      case 'right':
        collisionCheckResult ? this.dx += 1 : this.dx -= 1;
        this.spriteX = this.spriteX === this.tankModel.right1.x ? this.tankModel.right2.x : this.tankModel.right1.x;
        this.spriteY = this.tankModel.right1.y;
        break;
      case 'left':
        collisionCheckResult ? this.dx -= 1 : this.dx += 1;
        this.spriteX = this.spriteX === this.tankModel.left1.x ? this.tankModel.left2.x : this.tankModel.left1.x;
        this.spriteY = this.tankModel.left1.y;
        break;
      case 'up':
        collisionCheckResult ? this.dy -= 1 : this.dy += 1;
        this.spriteX = this.spriteX === this.tankModel.up1.x ? this.tankModel.up2.x : this.tankModel.up1.x;
        this.spriteY = this.tankModel.up1.y;
        break;
      case 'down':
        collisionCheckResult ? this.dy += 1 : this.dy -= 1;
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
    if(this.reload === false){
      this.reload = true
      setTimeout(() => {
        this.reload = false
      }, 1000);
       new Bullet({x: this.dx, y: this.dy}, this.renderer).move(this.direction)
    }
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
      ' ': () => { this.shoot()}
    });
  }
}