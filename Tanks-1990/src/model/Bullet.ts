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
  spriteWidth: number = 25
  spriteHeight: number = 20
  bulletWidth: number = 25
  bulletHeight: number = 25
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

  move(direction: string) {
    this.getShootDirection(direction)
    switch (direction) {
      case 'left':
        let bulletMoveLeft = setInterval(() => {
          this.dx -= this.speed
          if (this.dx <= 10) {
            this.explosion()
            clearInterval(bulletMoveLeft)
          }
        }, 16)
        break
      case 'right':
        let bulletMoveRight = setInterval(() => {
          this.dx += this.speed
          if (this.dx >= 823) {
            this.explosion()
            clearInterval(bulletMoveRight)
          }
        }, 16)
        break
      case 'up':
        let bulletMoveUp = setInterval(() => {
          this.dy -= this.speed
          if (this.dy <= 0) {
            this.explosion()
            clearInterval(bulletMoveUp)
          }
        }, 16)
        break
      case 'down':
        let bulletMoveDown = setInterval(() => {
          this.dy += this.speed
          if (this.dy >= 788) {
            this.explosion()
            clearInterval(bulletMoveDown)
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
          console.log('1', spriteCounter)
          this.spriteX = spriteExplosionX1
          this.spriteY = spriteExplosionY
          this.bulletWidth = 50
          this.bulletHeight = 50
          this.spriteWidth = 68
          this.spriteHeight = 68
          this.dx -= 20
          this.dy -= 5
        }
        else if (spriteCounter == 1) {
          spriteCounter++
          console.log('2', spriteCounter)
          this.spriteX = spriteExplosionX2
          this.spriteY = spriteExplosionY
          this.bulletWidth = 50
          this.bulletHeight = 50
          this.spriteWidth = 68
          this.spriteHeight = 68
        }
        else if (spriteCounter == 2) {
          spriteCounter++
          console.log('3', spriteCounter)
          this.spriteX = spriteExplosionX3
          this.spriteY = spriteExplosionY
          this.bulletWidth = 50
          this.bulletHeight = 50
          this.spriteWidth = 68
          this.spriteHeight = 68
          this.timeoutID = 0
          this.isAlive = false
        }
      }, 50)
  }
}
