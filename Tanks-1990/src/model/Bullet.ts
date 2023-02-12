// @ts-ignore
import sprite, { spriteMap } from '../view/sprite.ts'
// @ts-ignore
import Renderer from './Renderer.ts'

interface BulletOptions {
  x: number
  y: number
}

export class Bullet {
  dx: number
  dy: number
  renderer: Renderer
  spriteX = 1321
  spriteY = 370
  spriteWidth: number = 10
  spriteHeight: number = 70
  bulletWidth: number = 10
  bulletHeight: number = 55
  timeoutID: number = 0
  isAlive: boolean = true
  speed: number = 2.5

  _pingRendererTimeoutCallback: () => void

  constructor(bulletOptions: BulletOptions, renderer: Renderer) {
    this.renderer = renderer
    this.dx = bulletOptions.x
    this.dy = bulletOptions.y

    this._pingRendererTimeoutCallback = () => {
      this.renderer.add({
        spriteX: this.spriteX,
        spriteY: this.spriteY,
        spriteWidth: this.spriteWidth,
        spriteHeight: this.spriteHeight,
        canvasWidth: this.bulletWidth,
        canvasHeight: this.bulletHeight,
        canvasX: this.dx,
        canvasY: this.dy,
      })
      if (this.isAlive) {
        this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16)
      }
    }
    this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16)
  }

  getShootDirection(direction: string) {
    if (direction == 'up') {
      this.dx += 20,
      this.dy -= 35 
      this.spriteX = spriteMap.bullet.up.x
      this.spriteY = 370
    }
    if (direction == 'down') {
      this.dx += 20, 
      this.dy += 15 
      this.spriteX = spriteMap.bullet.down.x
      this.spriteY = 370
    }
    if (direction == 'left') {
     this.dx = this.dx,
     this.dy -= 10
     this.spriteX = spriteMap.bullet.left.x
    this.spriteY = 370
    }
    if (direction == 'right') {
      this.dx += 50,
      this.dy -= 10 
      this.spriteX = spriteMap.bullet.right.x
      this.spriteY = 370
    }
  }

  move(direction: string) {
    this.getShootDirection(direction)
    switch (direction) {
      case 'left':
        let bulletMoveLeft = setInterval(() => {
          this.dx -= this.speed
        }, 16)

        if (this.dx <= 0) {
          clearInterval(bulletMoveLeft)
        }
        break
      case 'right':
        let bulletMoveRight = setInterval(() => {
          this.dx += this.speed
        }, 16)
        if (this.dx <= 0) {
          clearInterval(bulletMoveRight)
        }
        break
      case 'up':
        let bulletMoveUp = setInterval(() => {
          this.dy -= this.speed
        }, 16)
        if (this.dx <= 0) {
          clearInterval(bulletMoveUp)
        }
        break
      case 'down':
        let bulletMoveDown = setInterval(() => {
          this.dy += this.speed
        }, 16)
        if (this.dx <= 0) {
          clearInterval(bulletMoveDown)
        }
        break
    }
  }
 

}
