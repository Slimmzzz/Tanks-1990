// @ts-ignore
import { Coords, direction, TankBlockedMoves, TankOptions } from "../interfaces.ts";
// @ts-ignore
import Renderer from "./Renderer.ts";
// @ts-ignore
import { SampleObstacle } from "./sampleObstacle.ts";
// @ts-ignore
import { spriteMap } from "../view/sprite.ts";


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
  occupiedCells: Coords[]
  isOnIce: boolean = false
  direction: direction
  ignoreKeyboard: boolean = false
  ignoreIce: boolean = false
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
    // if (this.isEnemy) {
    //   this.initEnemyBehavior();
    // }
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

  recalculateOccupiedCells() {
    this.occupiedCells = [];
    const upLeft = {x: Math.floor(this.dx / 32), y: Math.floor(this.dy / 32)};
    const upRight = {x: Math.floor((this.dx + 32) / 32), y: Math.floor(this.dy / 32)};
    const downLeft = {x: Math.floor(this.dx / 32), y: Math.floor((this.dy + 32) / 32)};
    const downRight = {x: Math.floor((this.dx + 32) / 32), y: Math.floor((this.dy + 32) / 32)};
    this.occupiedCells = [upLeft, upRight, downLeft, downRight];

    const possiblyUpRight = {x: Math.floor((this.dx + this.tankWidth) / 32), y: Math.floor(this.dy / 32)};
    if (JSON.stringify(possiblyUpRight) !== JSON.stringify(upRight)) {
      this.occupiedCells.push(possiblyUpRight);
      this.occupiedCells.push({x: Math.floor((this.dx + this.tankWidth) / 32), y: Math.floor((this.dy + 32) / 32)});
    }

    const possiblyDownLeft = {x: Math.floor(this.dx / 32), y: Math.floor((this.dy + this.tankHeight) / 32)};
    if (JSON.stringify(possiblyDownLeft) !== JSON.stringify(downLeft)) {
      this.occupiedCells.push(possiblyDownLeft);
      this.occupiedCells.push({x: Math.floor((this.dx + 32) / 32), y: Math.floor((this.dy + this.tankHeight) / 32)});
    }

    const possiblyDownRight = {x: Math.floor((this.dx + this.tankWidth) / 32), y: Math.floor((this.dy + this.tankHeight) / 32)};
    if (JSON.stringify(possiblyDownRight) !== JSON.stringify(downRight)) {
      this.occupiedCells.push(possiblyDownRight);
      this.occupiedCells.push({x: Math.floor((this.dx + 32) / 32), y: Math.floor((this.dy + this.tankHeight) / 32)});
    }
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
        console.log('Uperlis');
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
    */
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

      this.recalculateOccupiedCells();

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

}