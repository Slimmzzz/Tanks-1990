// @ts-ignore
import { TankBlockedMoves, direction } from '../interfaces';
// @ts-ignore
import sprite, { spriteMap } from '../view/sprite.ts'
// @ts-ignore
import Renderer from './Renderer.ts'
// @ts-ignore
import { Obstacle } from "./sampleObstacle.ts";
// @ts-ignore
import Tank from './sampleTank.ts';
// @ts-ignore
import { collidesWithCanvasBoundaries, FakeCreature } from './helpers.ts';

interface BulletOptions {
  id: number
  x: number
  y: number
}

export class Bullet {
  dx: number
  dy: number
  renderer: Renderer
  spriteX = 1321
  spriteY = 370
  spriteWidth: number = 25
  spriteHeight: number = 20
  width: number = 25
  height: number = 25
  timeoutID: number = 0
  isAlive: boolean = true
  speed: number = 2.5
  id: number
  ignoreIce: boolean = false
  ignoreKeyboard: boolean = false
  blockedMoves: TankBlockedMoves = {
    left: false,
    right: false,
    up: false,
    down: false
  }
  bulletFly: boolean = true
  tank: Tank
  bulletMoveInterval: number = 0

  _pingRendererTimeoutCallback: () => void

  constructor(bulletOptions: BulletOptions, renderer: Renderer, tank: Tank) {
    this.renderer = renderer
    this.tank = tank;
    this.id = bulletOptions.id
    this.dx = bulletOptions.x
    this.dy = bulletOptions.y

    this._pingRendererTimeoutCallback = () => {
      this.renderer.add({
        spriteX: this.spriteX,
        spriteY: this.spriteY,
        spriteWidth: this.spriteWidth,
        spriteHeight: this.spriteHeight,
        canvasWidth: this.width,
        canvasHeight: this.height,
        canvasX: this.dx,
        canvasY: this.dy,
      })
      if (this.isAlive) {
        this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16)
      }
    }
    this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
    this.renderer.bullets.push(this);
  }

  getShootDirection(direction: string) {
    if (direction == 'up') {
      ;(this.dx += 20), (this.dy -= 35)
      this.spriteX = spriteMap.bullet.up.x
      this.spriteY = spriteMap.bullet.up.y
    }
    if (direction == 'down') {
      ;(this.dx += 20), (this.dy += 15)
      this.spriteX = spriteMap.bullet.down.x
      this.spriteY = spriteMap.bullet.down.y
    }
    if (direction == 'left') {
      ;(this.dx = this.dx), (this.dy += 20)
      this.spriteX = spriteMap.bullet.left.x
      this.spriteY = spriteMap.bullet.left.y
    }
    if (direction == 'right') {
      ;(this.dx += 50), (this.dy += 17)
      this.spriteX = spriteMap.bullet.right.x
      this.spriteY = spriteMap.bullet.right.y
    }
  }

  checkForObstacle(direction: direction) {
    // Check for canvas boundries
    if (collidesWithCanvasBoundaries(this, direction)) {
      console.log('Here');
      this.bulletFly = false;
      return;
    }

    const obstacleMap = this.renderer.obstacleCoordsMatrix;
    const LookupY = Math.floor((this.dy + this.height) / 32);
    const LookupXLeft = Math.floor((this.dx + 1) / 32);
    const LookupXRight = Math.floor((this.dx + this.width - 1) / 32);
    if(obstacleMap[LookupY][LookupXLeft] != null){
      this.bulletFly = false
      this.explosion()
    }
  }
  
  move(direction: string) {
    this.getShootDirection(direction)
    switch (direction) {
      case 'left':
        this.bulletMoveInterval = setInterval(() => {
          this.checkForObstacle(direction)
          this.dx -= this.speed
          if(this.bulletFly == false){
            this.destroy()
          }
        }, 16)
        break
      case 'right':
        this.bulletMoveInterval = setInterval(() => {
          this.checkForObstacle(direction)
          this.dx += this.speed
          if(this.bulletFly == false){
            this.destroy(false)
          }
        }, 16)
        break
      case 'up':
        this.bulletMoveInterval = setInterval(() => {
          this.dy -= this.speed
          this.checkForObstacle(direction)
          if(this.bulletFly == false){
            this.destroy()
          }
        }, 16)
        break
      case 'down':
        this.bulletMoveInterval = setInterval(() => {
          this.dy += this.speed
          this.checkForObstacle(direction)
          if(this.bulletFly == false){
            this.destroy()
          }
        }, 16)
        break
    }
  }

  explosion() {
    let spriteCounter = 0
    const spriteExplosionY = 508
    const spriteExplosionX1 = 1045
      const spriteExplosionX2 = 1110
      const spriteExplosionX3 = 1180
      setInterval(() => {
        if (spriteCounter == 0) {
          spriteCounter++
          this.spriteX = spriteExplosionX1
          this.spriteY = spriteExplosionY
          this.width = 50
          this.height = 50
          this.spriteWidth = 68
          this.spriteHeight = 68
          this.dx -= 20
          this.dy -= 5
        }
        else if (spriteCounter == 1) {
          spriteCounter++
          this.spriteX = spriteExplosionX2
          this.spriteY = spriteExplosionY
          this.width = 50
          this.height = 50
          this.spriteWidth = 68
          this.spriteHeight = 68
        }
        else if (spriteCounter == 2) {
          spriteCounter++
          this.spriteX = spriteExplosionX3
          this.spriteY = spriteExplosionY
          this.width = 50
          this.height = 50
          this.spriteWidth = 68
          this.spriteHeight = 68
          this.timeoutID = 0
          this.isAlive = false
        }
      }, 50)
  }

  destroy(isExploding: boolean = true) {
    clearInterval(this.bulletMoveInterval);
    if (isExploding) {
      this.explosion();
    }
    this.tank.hasActiveBullet = false;
    const spliceIndex = this.renderer.bullets.findIndex( (b: Bullet) => {
      return b.id === this.id;
    });
    this.renderer.bullets.splice(spliceIndex, 1);
  }
}
