// @ts-ignore
import { Coords, direction, TankBlockedMoves, TankOptions } from "../interfaces.ts";
// @ts-ignore
import Renderer from "./Renderer.ts";
// @ts-ignore
import { spriteMap } from "../view/sprite.ts";
// @ts-ignore
import { KeyController } from "../controller/KeyController.ts";
// @ts-ignore
import { Bullet } from "./Bullet.ts";
// @ts-ignore
import enemyBehaviour from './ai.ts';
// @ts-ignore
import { collidesWithCanvasBoundaries, collidesWithObstacles, renderScore } from "./helpers.ts";
// @ts-ignore
import { Globals } from '../app.ts';
// @ts-ignore
import { Pickup } from './Pickup.ts';

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
  tankColor: string
  tankType: string;
  bonuses: string[] = []
  reload: boolean = false
  hasActiveBullet: boolean = false
  shootAiTimeout: number = 0
  moveAiTimeout: number = 0
  speed: number = 1
  hp: number = 1
  killScore: number = 100
  changeColorCallback: () => void;
  changeColorTimeout: number = 0;
  isInvincible: boolean = false;
  invincibleAnimationTimeout: number = 0
  invincibleAnimationCallback: () => void
  invinciblePosition: Coords = spriteMap.ressurectionBubble.frame1
  invincibleFrameIterator: number = 0
  playerLevel: number = 1

  constructor(tankOptions: TankOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.id = tankOptions.id;
    this.dx = tankOptions.x;
    this.dy = tankOptions.y;
    this.spriteWidth = tankOptions.tankModelWidth || 52;
    this.spriteHeight = tankOptions.tankModelHeight || 52;
    this.isEnemy = tankOptions.isEnemy;
    this.speed = tankOptions.speed;
    if (tankOptions.hp) {
      this.hp = tankOptions.hp;
    }
    if (tankOptions.killScore) {
      this.killScore = tankOptions.killScore;
    }

    // Определение типа/цвета танка, связанная с этим логика
    this.tankColor = tankOptions.tankColor || 'yellow';
    this.tankType = tankOptions.tankType;
    this.tankModel = spriteMap.tanks[tankOptions.tankType || 'player'][tankOptions.tankColor || 'yellow'];
    this.changeColorCallback = () => {
      this.tankColor = this.tankColor === 'red' ? 'grey' : 'red';
      this.tankModel = spriteMap.tanks[this.tankType][this.tankColor];
      this.changeColorTimeout = setTimeout(this.changeColorCallback, 600);
    };

    // Если танк красного цвета - засовываем в него бонус и заставляем его моргать
    if (this.tankColor === 'red') {
      const bonuses = ['helmet', 'clock', 'shovel', 'star', 'grenade', 'tank', 'pistol'];
      bonuses.sort((a, b) => Math.random() - 0.5);
      let bonusesCount = Math.floor(Math.random() * this.hp) || 1;
      for (let i = 0; i < bonusesCount; i++) {
        this.bonuses.push(bonuses.pop()!);
      }
      this.changeColorTimeout = setTimeout(this.changeColorCallback, 600);
    }

    // Подбор модели танка в зависимости от направления, типа и цвета
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

    // Назначение игроку контролера клавиатуры, а врагу - искусственного интеллекта
    if (this.isEnemy) {
      if (!tankOptions.ignoreAIBehaviour && !this.renderer.game.areEnemiesFreezed) {
        this.initEnemyBehavior();
      }
    } else {
      this.initKeyController();
    }

    // Анимация неуязвимости
    this.invincibleAnimationCallback = () => {
      this.invincibleFrameIterator += 1;
      if (this.invincibleFrameIterator > 5) {
        this.invincibleFrameIterator = 0;
        this.invinciblePosition.x = this.invinciblePosition.x === 1052 ? 1116 : 1052;
      }
      this.renderer.add({
        spriteX: this.invinciblePosition.x,
        spriteY: this.invinciblePosition.y,
        spriteWidth: 64,
        spriteHeight: 64,
        canvasWidth: 64,
        canvasHeight: 64,
        canvasX: this.dx - 6,
        canvasY: this.dy - 6
      });
      this.invincibleAnimationTimeout = setTimeout(this.invincibleAnimationCallback, 16);
    }

    if (!this.isEnemy) {
      // Игрок стартует неуязвимым
      this.isInvincible = true;
      this.startInvincibleAnimation();
      setTimeout(() => {
        this.isInvincible = false;
        clearTimeout(this.invincibleAnimationTimeout);
      }, 3000);

      // Обработчики событий повышения уровня
      document.addEventListener('game:update-player-level', () => {
        if (this.playerLevel < 4) {
          this.playerLevel += 1;
          this.updatePlayerLevel();
          Globals.playerLevel = this.playerLevel;
        }
      });
      document.addEventListener('game:pistol', () => {
        if (this.playerLevel < 3) {
          this.playerLevel = 3;
        }
        document.dispatchEvent(new CustomEvent('game:update-player-level'));
      });
    }
    this.animateSpawn();
  }

  initEnemyBehavior() {
    enemyBehaviour(this);
    const shootAiCallback = () => {
      this.shoot();
      this.shootAiTimeout = setTimeout(shootAiCallback, 1000);
    }
    shootAiCallback();
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
      if (collidesWithTank) {
        return false;
      }
    }

    // Collision with pickups
    if (!this.isEnemy) {
      let maybePickup;
      for (const pickup of this.renderer.pickups) {
        if (direction === 'up') {
          if (this.dy === pickup.dy + pickup.height + 1) {
            if (this.dx === pickup.dx || (this.dx > pickup.dx &&
              this.dx < pickup.dx + pickup.width) ||
              (this.dx + this.width > pickup.dx &&
                this.dx + this.width < pickup.dx + pickup.width)
              ) {
              maybePickup = pickup;
              break;
            }
          }
        } else if (direction === 'down') {
          if (this.dy + this.height === pickup.dy - 1) {
            if (
              this.dx === pickup.dx ||
              (this.dx > pickup.dx &&
                this.dx < pickup.dx + pickup.width) ||
                (this.dx + this.width > pickup.dx &&
                  this.dx + this.width < pickup.dx + pickup.width)  
            ) {
              maybePickup = pickup;
              break;
            }
          }
        } else if (direction === 'left') {
          if (this.dx === pickup.dx + pickup.width + 1) {
            if (
              this.dy === pickup.dy ||
              (this.dy > pickup.dy &&
                this.dy < pickup.dy + pickup.height) ||
              (this.dy + this.height > pickup.dy &&
                this.dy + this.height < pickup.dy + pickup.height)
            ) {
              maybePickup = pickup; 
              break;
            }
          }
        } else if (direction === 'right') {
          if (this.dx + this.width === pickup.dx - 1) {
            if (
              this.dy === pickup.dy ||
              (this.dy > pickup.dy &&
                this.dy < pickup.dy + pickup.height) ||
              (this.dy + this.height > pickup.dy &&
                this.dy + this.height < pickup.dy + pickup.height)
            ) {
              maybePickup = pickup; 
              break;
            }
          }
        }
      }  
      if (maybePickup) {
        maybePickup.action();
        maybePickup.destroy();
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
            try {
              this.move(direction);
            if (i) {
              iceTimeout = setTimeout(iceTimeoutCallback, 16);
              i--;
            } else {
              clearTimeout(iceTimeout);
              this.ignoreKeyboard = false;
              this.ignoreIce = false;
            }
            } catch (error) {
              clearTimeout(iceTimeout);
            }
          }
          iceTimeout = setTimeout(iceTimeoutCallback, 16);
        }
      }
    }
    return true;
  }

  startInvincibleAnimation() {
    this.invincibleAnimationTimeout = setTimeout(this.invincibleAnimationCallback, 16);
  }

  updatePlayerLevel() {
    this.tankType = `player${this.playerLevel}`;
    this.tankModel = spriteMap.tanks[this.tankType][this.tankColor];
    this.spriteWidth = spriteMap.tanks[this.tankType].spriteWidth;
    this.spriteHeight = spriteMap.tanks[this.tankType].spriteHeight;
    if (this.playerLevel === 4) {
      this.hp = 2;
    }
  }

  move(direction: direction) {
    if (this.isAlive) {
      for (const key in this.blockedMoves) {
        if (key !== direction) {
          this.blockedMoves[key as direction] = false;
        }
      }
  
      const collisionCheckResult = this.checkCollisions(direction);
      if (!this.blockedMoves[direction]) {
        this._isMoving = true;
        this.shiftCallback(direction, collisionCheckResult);
        if (!this.isEnemy) {
          Globals.audio.level.play();
        }
  
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
  }

  private shiftCallback(direction: direction, collisionCheckResult: boolean) {
    this.direction = direction;
    switch (direction) {
      case 'right':
        collisionCheckResult ? this.dx += 1 * this.speed : this.dx -= 0;
        this.spriteX = this.spriteX === this.tankModel.right1.x ? this.tankModel.right2.x : this.tankModel.right1.x;
        this.spriteY = this.tankModel.right1.y;
        break;
      case 'left':
        collisionCheckResult ? this.dx -= 1 * this.speed : this.dx += 0;
        this.spriteX = this.spriteX === this.tankModel.left1.x ? this.tankModel.left2.x : this.tankModel.left1.x;
        this.spriteY = this.tankModel.left1.y;
        break;
      case 'up':
        collisionCheckResult ? this.dy -= 1 * this.speed : this.dy += 0;
        this.spriteX = this.spriteX === this.tankModel.up1.x ? this.tankModel.up2.x : this.tankModel.up1.x;
        this.spriteY = this.tankModel.up1.y;
        break;
      case 'down':
        collisionCheckResult ? this.dy += 1 * this.speed : this.dy -= 0;
        this.spriteX = this.spriteX === this.tankModel.down1.x ? this.tankModel.down2.x : this.tankModel.down1.x;
        this.spriteY = this.tankModel.down1.y;
        break;
    }
  }

  stop() {
    if (!this._isMoving) {
      Globals.audio.level.pause();
      clearTimeout(this.moveTimeoutID);
    }
  }

  shoot() {
    if (this.isAlive && !this.hasActiveBullet && !this.reload) {
      new Bullet({
        id: this.renderer.nextBulletID,
        x: this.dx, 
        y: this.dy
      }, this.renderer, this).move(this.direction);
      this.reload = true;
      setTimeout(() => {
        this.reload = false;
      }, 160);
      if (!this.isEnemy) {
        Globals.audio.shot.play();
        if (this.playerLevel > 2) {
          setTimeout(() => {
            new Bullet({
              id: this.renderer.nextBulletID,
              x: this.dx, 
              y: this.dy,
              isBonusBullet: true
            }, this.renderer, this).move(this.direction);
            this.renderer.nextBulletID += 1;
          }, 160)
        }
      }
      this.hasActiveBullet = true;
      this.renderer.nextBulletID += 1;
    }
  }

  dropPickup() {
    const type = this.bonuses.pop();
    const x = Math.floor(Math.random() * (this.renderer.canvas.width - 64));
    const y = Math.floor(Math.random() * (this.renderer.canvas.height - 60));
    const id = Number(`${this.renderer.game!.currentPickupId}`);
    this.renderer.game!.currentPickupId += 1;

    if (this.renderer.pickups.length) {
      this.renderer.pickups[0].destroy();
    }

    this.renderer.pickups.push(new Pickup({ x, y, type: (<string>type), id }, this.renderer))
  }

  animateSpawn() {
    let i = 0;
    let dx = Number(String(this.dx)) - 2;
    let dy = Number(String(this.dy)) - 2;
    let timeout = 0;
    let frame = spriteMap.spawnBubble.frame1;

    let spawnAnimationCallback = () => {
      if ((i >= 5 && i < 10) || (i >= 25 && i < 30)) {
        frame = spriteMap.spawnBubble.frame2;
      } else if ((i >= 10 && i < 15) || (i >= 20 && i < 25)) {
        frame = spriteMap.spawnBubble.frame3;
      } else if (i >= 15 && i < 20) {
        frame = spriteMap.spawnBubble.frame4;
      } else if (i >= 30 && i < 35) {
        frame = spriteMap.spawnBubble.frame1;
      } else if (i >= 35) {
        clearTimeout(timeout);
      }
      this.renderer.add({
        spriteX: frame.x,
        spriteY: frame.y,
        spriteWidth: 64,
        spriteHeight: 64,
        canvasWidth: 64,
        canvasHeight: 64,
        canvasX: dx,
        canvasY: dy,
      });
      i += 1;
      if (i < 35) {
        timeout = setTimeout(spawnAnimationCallback, 16);
      }
    };
    spawnAnimationCallback();
  }

  animateExposion() {
    let i = 0;
    let timeout = 0;
    const explosionCallback = () => {
      this.renderer.add({
        spriteX: spriteMap.explosion[`frame${i < 5 ? '1' : '2'}`].x,
        spriteY: spriteMap.explosion.frame1.y,
        spriteWidth: 128,
        spriteHeight: 128,
        canvasWidth: 128,
        canvasHeight: 128,
        canvasX: this.dx - 32,
        canvasY: this.dy - 32,
      });
      if (i < 10) {
        i += 1;
        timeout = setTimeout(explosionCallback, 16);
      } else {
        clearTimeout(timeout);
      }
    }
    explosionCallback();
  }

  die() {
    this.isAlive = false;
    this.animateExposion();
    this.destroy();
    if (this.isEnemy) {
      this.renderer.game.enemiesToGo -= 1;
      if (this.renderer.game.enemiesToGo > 0) {
        this.renderer.game.spawnTankTimeout = setTimeout(this.renderer.game.spawnTankCallback, 80);
      }
      this.renderer.game.score += this.killScore;
      renderScore(this, this.killScore);
      this.renderer.game.enemiesKilledByScore[`${this.killScore}`] += 1;

      document.dispatchEvent(new CustomEvent('ui:update-score', {
        detail: {
          score: this.renderer.game.score
        }
      }));
      document.dispatchEvent(new CustomEvent('ui:remove-enemy-tank', {
        detail: {
          tanks: this.renderer.game.enemiesToGo
        }
      }));
      if (!this.renderer.game.enemiesToGo) {
        const playerTank = this.renderer.tanks.find((tank: Tank) => tank.id === 1);
        playerTank.isInvincible = true;
        document.dispatchEvent(new CustomEvent('ui:complete-level', {
          detail: {
            playerTankLevel: playerTank.playerLevel,
            playerLives: this.renderer.game.playerLives,
            score: this.renderer.game.score,
            enemiesKilledByScore: this.renderer.game.enemiesKilledByScore
          }
        }))
      }
    } else {
      this.dx = this.dy = -80;
      this.renderer.game.playerLives -= 1;
      if (this.renderer.game.playerLives !== 0) {
        document.dispatchEvent(new CustomEvent('ui:update-health', {
          detail: {
            health: this.renderer.game.playerLives
          }
        }));
        this.renderer.tanks.push(new Tank({
          id: 1,
          x: 263,
          y: 832 - 57,
          startDirection: 'up',
          isEnemy: false,
          speed: 1,
        }, this.renderer));
      } else {
        Globals.isGameOver = true;
        document.dispatchEvent(new CustomEvent('ui:update-health', {
          detail: {
            health: this.renderer.game.playerLives
          }
        }));
        document.dispatchEvent(new CustomEvent('ui:game-over', {
          detail: {
            score: this.renderer.game.score,
            enemiesKilledByScore: this.renderer.game.enemiesKilledByScore
          }
        }));
      }
    }
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
    if (!!this.keyboardController) {
      this.keyboardController.destroy();
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

    new KeyController({
      ' ': () => { this.shoot(); }
    });
  }
}