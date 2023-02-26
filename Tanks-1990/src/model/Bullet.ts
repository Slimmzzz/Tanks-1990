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
import * as Helpers from './helpers.ts';
// @ts-ignore
import { Globals } from '../app.ts';
// @ts-ignore
import { gameOver } from '../view/Scene/gameOver/gameOver.ts';

// export let scoreArray: number[] = []


interface BulletOptions {
  id: number
  x: number
  y: number
  isBonusBullet?: boolean
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
  isBonusBullet: boolean = false

  _pingRendererTimeoutCallback: () => void

  constructor(bulletOptions: BulletOptions, renderer: Renderer, tank: Tank) {
    this.renderer = renderer
    this.tank = tank;
    this.id = bulletOptions.id
    this.dx = bulletOptions.x
    this.dy = bulletOptions.y
    if (bulletOptions.isBonusBullet) {
      this.isBonusBullet = true;
    }
    if (this.tank.playerLevel > 1) {
      this.speed = 3;
    }

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
      (this.dx += (this.tank.width / 2) - (this.width / 4)), (this.dy = this.tank.dy - this.height)
      this.spriteX = spriteMap.bullet.up.x
      this.spriteY = spriteMap.bullet.up.y
    }
    if (direction == 'down') {
      this.dx += (this.tank.width / 2) - (this.width / 4);
      this.dy += this.tank.height;
      this.spriteX = spriteMap.bullet.down.x;
      this.spriteY = spriteMap.bullet.down.y;
    }
    if (direction == 'left') {
      this.dx = this.tank.dx - this.width;
      this.dy = (this.tank.height / 2) + this.tank.dy - (this.height / 4);
      this.spriteX = spriteMap.bullet.left.x;
      this.spriteY = spriteMap.bullet.left.y;
    }
    if (direction == 'right') {
      this.dx = this.tank.dx + this.tank.width;
      this.dy = (this.tank.height / 2) - (this.height / 4) + this.tank.dy;
      this.spriteX = spriteMap.bullet.right.x;
      this.spriteY = spriteMap.bullet.right.y;
    }
  }

  checkForObstacle(direction: direction) {
    // Check for canvas boundries
    if (Helpers.collidesWithCanvasBoundaries(this, direction)) {
      this.bulletFly = false;
      if (this.tank.id === 1) {
        Globals.audio.hitBorder.currentTime = 0;
        Globals.audio.hitBorder.play();
      }
      return;
    }

    // Collision with Eagle
    let hitsEagle: boolean = false;
    if (!Globals.isGameOver) {
        if (this.dy > 32 * 24) {
          if (this.dx > 32 * 12 && this.dx < 32 * 14) {
            hitsEagle = true;
          }
        }
    }

    if (hitsEagle) {
      Globals.isGameOver = true;
      Globals.audio.hitEagle.play();
      this.renderer.eagle.spriteX = spriteMap.eagle.dead.x;
      this.renderer.eagle.spriteY = spriteMap.eagle.dead.y;
      document.dispatchEvent(new CustomEvent('ui:game-over', {
        detail: {
          score: this.renderer.game.score,
          enemiesKilledByScore: this.renderer.game.enemiesKilledByScore
        }
      }))
      this.bulletFly = false;
      gameOver();
      return;
    }
    
    // Check collisions for obstacles
    let maybeObstacles = Helpers.collidesWithObstacles(this, direction);
    if (Array.isArray(maybeObstacles) && maybeObstacles.length) {
      for (const obstacle of maybeObstacles) {
        if (!obstacle.canShootThrough) {
          this.bulletFly = false;
          const breakArmor = this.tank.playerLevel === 4;
          if (obstacle.type === 'b' || (obstacle.type === 'a' && breakArmor)) {
            obstacle.isHitFrom[direction] = true;
            obstacle.modify(direction, breakArmor);
          }
        }
      }
      return;
    }


    // Check collisions with tanks
    let maybeTank = Helpers.collidesWithDynamicObject(this, direction, 'tanks');
    if (maybeTank) {
      this.bulletFly = false;
      if (this.tank.isEnemy !== maybeTank.isEnemy) {
        Globals.audio.tankDamage.currentTime = 0;
        Globals.audio.tankDamage.play();
        if (!maybeTank.isInvincible) {
          maybeTank.hp -= 1;
        }
        if (maybeTank.playerLevel === 4) {
          maybeTank.playerLevel = 1;
          document.dispatchEvent(new CustomEvent('game:update-player-level'));
        }
        if (!maybeTank.hp) {
          maybeTank.die();
        } else {
          if (maybeTank.tankColor === 'red') {
            if (maybeTank.bonuses.length) {
              maybeTank.dropPickup();
              if (!maybeTank.bonuses.length) {
                clearTimeout(maybeTank.changeColorTimeout);
                maybeTank.tankColor = 'grey';
                maybeTank.tankModel = spriteMap.tanks[maybeTank.tankType][maybeTank.tankColor];
              }
            } 
          }
        }
      }
    }
    // if(maybeTank && location.hash == '#stage'){
      
    //   if(maybeTank.isAlive == false && maybeTank.isEnemy == true){
    //     scoreArray.push(maybeTank.killScore)
    //     console.log(scoreArray)
    //   }
    // }
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
            this.destroy()
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
    if (!this.isBonusBullet) {
      this.tank.hasActiveBullet = false;
    }
    const spliceIndex = this.renderer.bullets.findIndex( (b: Bullet) => {
      return b.id === this.id;
    });
    this.renderer.bullets.splice(spliceIndex, 1);
    Globals.audio.shot.pause();
    Globals.audio.shot.currentTime = 0;
  }
}
