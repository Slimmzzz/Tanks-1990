// @ts-ignore
import { DrawOptions } from "../interfaces.ts"
// @ts-ignore
import sprite from "../view/sprite.ts"
// @ts-ignore
import { Obstacle } from "./sampleObstacle.ts"
// @ts-ignore
import Tank from './sampleTank.ts';


export default class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  drawStack: DrawOptions[] = []
  tiomeoutID: number | undefined
  isActive: boolean = false
  obstacles: Obstacle[] = []
  tanks: Tank[] = []
  
  constructor(root: HTMLDivElement) {
    this.canvas = root.appendChild(document.createElement('canvas'));
    this.canvas.classList.add('canvas')
    this.canvas.width = this.canvas.height = 832;
    this.canvas.style.border = '1px solid #000';
    this.canvas.style.background = "#000";
    this.ctx = this.canvas.getContext('2d')!;
    this.isActive = true;
    this.tiomeoutID = setTimeout(this.render.bind(this), 16);
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
      this.tiomeoutID = setTimeout(this.render.bind(this), 16);
    }
  }

  addObstacle(obstacle: Obstacle) {
    this.obstacles.push(obstacle);
  }

  destroy() {
    if (this.tiomeoutID) {
      clearTimeout(this.tiomeoutID);
    }
    this.isActive = false;
    this.canvas.remove();
  }
}