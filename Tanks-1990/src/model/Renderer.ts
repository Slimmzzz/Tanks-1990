import { Coords, DrawOptions } from "../interfaces";
// @ts-ignore
import sprite from "../view/sprite.ts"
import { Bullet } from "./Bullet";
// @ts-ignore
import { Obstacle } from "./sampleObstacle.ts"
// @ts-ignore
import Tank from './sampleTank.ts';
import Game from '../controller/Game';


export default class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  style: string = 'border: 1px solid #000; background: #000;'
  drawStack: DrawOptions[] = []
  timeoutID: number | undefined
  isActive: boolean = false
  obstacles: Obstacle[] = []
  tanks: Tank[] = []
  bullets: Bullet[] = []
  bulletNextID: number = 1
  obstacleCoordsMatrix: Obstacle[][] = [];
  game: Game | undefined = undefined

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

  addObstacle(obstacle: Obstacle) {
    this.obstacles.push(obstacle);
  }

  destroy() {
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
    this.isActive = false;
    this.canvas.remove();
  }
}