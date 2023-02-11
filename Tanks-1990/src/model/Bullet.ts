import Renderer from './Renderer'


interface BullerOptions {
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
  speed: number = 5

  _pingRendererTimeoutCallback: () => void

  constructor(bulletOptions: BullerOptions, renderer: Renderer) {
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

  move(direction: string) {
    switch (direction) {
      case 'left':
        let bulletMoveLeft = setInterval(() => {
          this.dx -= this.speed
        }, 30)

        if (this.dx <= 0) {
          clearInterval(bulletMoveLeft)
        }
        break
      case 'right':
        let bulletMoveRight = setInterval(() => {
          this.dx += this.speed
        }, 30)
        if (this.dx <= 0) {
          clearInterval(bulletMoveRight)
        }
        break
      case 'up':
        let bulletMoveUp = setInterval(() => {
          this.dy -= this.speed
        }, 30)
        if (this.dx <= 0) {
          clearInterval(bulletMoveUp)
        }
        break
      case 'down':
        let bulletMoveDown = setInterval(() => {
          this.dy += this.speed
        }, 30)
        if (this.dx <= 0) {
          clearInterval(bulletMoveDown)
        }
        break
    }
  }
}
