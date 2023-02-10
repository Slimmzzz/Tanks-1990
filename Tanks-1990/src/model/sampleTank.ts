// @ts-ignore
import { Coords, direction, TankBlockedMoves, TankOptions } from "../interfaces.ts";
// @ts-ignore
import Renderer from "./Renderer.ts";
// @ts-ignore
import { SampleObstacle } from "./sampleObstacle.ts";


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
  blockedMoves: TankBlockedMoves = {
    left: false,
    right: false,
    up: false,
    down: false
  }
  _pingRendererTimeoutCallback: () => void

  constructor(tankOptions: TankOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.dx = tankOptions.x;
    this.dy = tankOptions.y;
    this.isEnemy = tankOptions.isEnemy;
    this.occupiedCells = [
      {x: Math.floor(tankOptions.x), y: Math.floor(tankOptions.y)},
      {x: Math.floor(tankOptions.x + 32), y: Math.floor(tankOptions.y)},
      {x: Math.floor(tankOptions.x), y: Math.floor(tankOptions.y + 32)},
      {x: Math.floor(tankOptions.x + 32), y: Math.floor(tankOptions.y + 32)},
    ];
    this.direction = tankOptions.startDirection as direction;
    switch (this.direction) {
      case 'up': this.spriteX = 4; this.spriteY = 8; break;
      case 'down': this.spriteY = 4; this.spriteX = (64 * 4) + 8; break;
      case 'right': this.spriteY = 4; this.spriteX = (64 * 6) + 8; break;
      case 'left': this.spriteY = 4; this.spriteX = (64 * 2) + 8; break;
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
    }

    /*
    let intersectingCell;
    for (const coords of this.occupiedCells) {
      for (const obstacle of this.renderer.obstacles) {
        if (JSON.stringify(coords) === JSON.stringify(obstacle.occupiedCell)) {
          // Проверка на возможность проехать через препятствие(кусты, лед)
          if (!obstacle.canPassThrough) {
            intersectingCell = obstacle;
            break;
          }
          if (obstacle.type === 'i') {
            this.isOnIce = true;
          }
        }
      }
      if (!!intersectingCell) {
        break;
      }
    }
    if (!!intersectingCell) {
      return false;
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
        this.spriteX = this.spriteX === (64 * 6) + 8 ? (64 * 7) + 12 : (64 * 6) + 8;
        this.spriteY = 4;
        break;
      case 'left':
        collisionCheckResult ? this.dx -= 1 : this.dx += 1;
        this.spriteX = this.spriteX === (64 * 2) + 8 ? (64 * 3) + 12 : (64 * 2) + 8;
        this.spriteY = 4;
        break;
      case 'up':
        collisionCheckResult ? this.dy -= 1 : this.dy += 1;
        this.spriteX = this.spriteX === 4 ? 68 : 4;
        this.spriteY = 8;
        break;
      case 'down':
        collisionCheckResult ? this.dy += 1 : this.dy -= 1;
        this.spriteX = this.spriteX === (64 * 4) + 8 ? (64 * 5) + 8 : (64 * 4) + 8;
        this.spriteY = 4;
        break;
    }
  }

  stop() {
    if (!this._isMoving) {
      clearTimeout(this.moveTimeoutID);
    }
  }

}