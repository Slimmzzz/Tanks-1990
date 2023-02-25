// @ts-ignore
import { ObstacleOptions } from '../interfaces.ts';
// @ts-ignore
import Renderer from './Renderer.ts';
// @ts-ignore
import { spriteMap } from '../view/sprite.ts';
// @ts-ignore
import Tank from './sampleTank.ts';
// @ts-ignore
import { Globals } from '../app.ts';
// @ts-ignore
import { Obstacle } from './sampleObstacle.ts';

export class Pickup {
  renderer: Renderer
  id: number
  dx: number
  dy: number
  width: number = 64
  height: number = 60
  type: string
  _pingRendererTimeoutCallback: () => void;
  timeoutID: number;
  spriteY: number;
  spriteX: number;
  blinkCounter: number = 0
  blinkTimeout: number = 0

  constructor(pickupOptions: ObstacleOptions, renderer: Renderer) {
    this.renderer = renderer;
    this.dx = pickupOptions.x;
    this.dy = pickupOptions.y;
    this.id = pickupOptions.id
    this.type = pickupOptions.type;
    this.spriteX = spriteMap.pickUps[this.type as keyof typeof spriteMap.pickUps].x;
    this.spriteY = spriteMap.pickUps[this.type as keyof typeof spriteMap.pickUps].y;

    this._pingRendererTimeoutCallback = () => {
      if (this.blinkCounter > 30) {
        clearTimeout(this.timeoutID);
        this.blinkCounter = 0;
        this.blinkTimeout = setTimeout(() => {
          this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
        }, 500)
      } else {
        if (this.blinkTimeout) {
          clearTimeout(this.blinkTimeout);
        }
        this.renderer.add({
          spriteX: this.spriteX,
          spriteY: this.spriteY,
          spriteWidth: this.width,
          spriteHeight: this.height,
          canvasX: this.dx,
          canvasY: this.dy,
        });
        this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
        this.blinkCounter += 1;
      }
    }
    this.timeoutID = setTimeout(this._pingRendererTimeoutCallback, 16);
  }

  action() {
    Globals.scoreGame += 500;
    switch(this.type) {
      case 'shovel': this.shovel(); break;
      case 'helmet': this.helmet(); break; 
      case 'clock': this.clock(); break;
      case 'star': this.star(); break;
      case 'grenade': this.grenade(); break;
      case 'tank': this.tank(); break;
      case 'pistol': this.pistol(); break;
    }
  }

  shovel() {
    const eagleBorderCoords = [
      {x: 11, y: 23},
      {x: 12, y: 23},
      {x: 13, y: 23},
      {x: 14, y: 23},
      {x: 11, y:24},
      {x: 11, y:25},
      {x: 14, y:24},
      {x: 14, y:25},
    ];
    let matrix = this.renderer.obstacleCoordsMatrix;
    for (let coords of eagleBorderCoords) {
      if (!!matrix[coords.y][coords.x]) {
        matrix[coords.y][coords.x].destroy();
      }
      matrix[coords.y][coords.x] = new Obstacle({
        id: this.renderer.game.level.nextObstacleID,
        type: 'a',
        x: coords.x,
        y: coords.y,
      }, this.renderer);
      this.renderer.game.level.nextObstacleID += 1;
      
      setTimeout(() => {
        matrix[coords.y][coords.x].destroy();
        matrix[coords.y][coords.x] = new Obstacle({
          id: this.renderer.game.level.nextObstacleID,
          type: 'b',
          x: coords.x,
          y: coords.y,
        }, this.renderer);
        this.renderer.game.level.nextObstacleID += 1;
      }, 30000)
    }
  }
  helmet() {
    const playerTank = this.renderer.tanks.find((tank: Tank) => tank.id === 1);
    playerTank.isInvincible = true;
    playerTank.startInvincibleAnimation();
    setTimeout(() => {
      playerTank.isInvincible = false;
      clearTimeout(playerTank.invincibleAnimationTimeout);
    }, 10000)
  }
  clock() {
    this.renderer.game.areEnemiesFreezed = true;
    for (const tank of this.renderer.tanks) {
      if (tank.isEnemy) {
        clearTimeout(tank.shootAiTimeout);
        clearTimeout(tank.moveAiTimeout);
      }
    }
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('game:unfreeze-enemies'));
    }, 20000)
  }
  star() {
    document.dispatchEvent(new CustomEvent('game:update-player-level'));
  }
  grenade() {
    this.renderer.tanks.forEach((tank: Tank) => {
      if (tank.isEnemy) {
        tank.die();
        document.dispatchEvent(new CustomEvent('ui:remove-enemy-tank', {
          detail: {
            tanks: this.renderer.game.enemiesToGo
          }
        }));
      }
    });
  }
  tank() {
    this.renderer.game.playerLives += 1;
    document.dispatchEvent(new CustomEvent('ui:update-health', {
      detail: {
        health: this.renderer.game.playerLives
      }
    }));
  }
  pistol() {
    document.dispatchEvent(new CustomEvent('game:pistol'));
  }

  destroy() {
    clearTimeout(this.timeoutID);
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }
    const pickUpIndex = this.renderer.pickups.findIndex((pickup: Pickup) => {
      return pickup.id === this.id;
    });
    this.renderer.pickups.splice(pickUpIndex, 1);
  }
}