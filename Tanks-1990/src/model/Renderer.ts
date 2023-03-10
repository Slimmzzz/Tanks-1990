import { DrawOptions } from "../interfaces";
// @ts-ignore
import sprite from "../view/sprite.ts"
import { Bullet } from "./Bullet";
// @ts-ignore
import { Obstacle } from "./sampleObstacle.ts"
// @ts-ignore
import Tank from './sampleTank.ts';
// @ts-ignore
import Game from '../controller/Game.ts';
// @ts-ignore
import { Pickup } from "./Pickup.ts";
// @ts-ignore
import { Eagle } from "./Eagle.ts";


export default class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  style: string = 'border: 1px solid #000; background: #000;'
  drawStack: DrawOptions[] = []
  timeoutID: number | undefined
  isActive: boolean = false
  tanks: Tank[] = []
  bullets: Bullet[] = []
  pickups: Pickup[] = []
  nextBulletID: number = 1
  obstacleCoordsMatrix: Obstacle[][] = [];
  game: Game | undefined = undefined
  eagle: Eagle | null = null;

  constructor(root: HTMLDivElement, style?: string) {
    this.canvas = root.appendChild(document.createElement('canvas'));
    this.canvas.classList.add('canvas');
    this.canvas.setAttribute('style', style || this.style);
    this.canvas.width = this.canvas.height = 832;
    this.ctx = this.canvas.getContext('2d')!;
    this.isActive = true;
    this.timeoutID = setTimeout(this.render.bind(this), 16);
  }

  add(drawOptions: DrawOptions) {
    this.drawStack.push(drawOptions)
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const item of this.drawStack) {
      if (item.isUnderLayer) {
        this.ctx.globalCompositeOperation = 'destination-over';  
      }
      this.ctx.drawImage(
        sprite,
        item.spriteX,
        item.spriteY,
        item.spriteWidth,
        item.spriteHeight,
        item.canvasX,
        item.canvasY,
        (item.canvasWidth || item.spriteWidth),
        (item.canvasHeight || item.spriteHeight)
      );
      if (item.isUnderLayer) {
        this.ctx.globalCompositeOperation = 'source-over';  
      }
    }
    this.drawStack = [];
    if (this.isActive) {
      this.timeoutID = setTimeout(this.render.bind(this), 16);
    }
  }

  destroy() {
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
    this.isActive = false;
    this.canvas.remove();
  }
}