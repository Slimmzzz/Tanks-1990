// @ts-ignore
import sprite from "../view/sprite.ts"
// @ts-ignore
import { MoveStoppers } from "./sampleObstacle.ts"

interface DrawOptions {
  spriteX: number
  spriteY: number
  spriteWidth: number
  spriteHeight: number
  canvasX: number
  canvasY: number
}

export default class Renderer {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  drawStack: DrawOptions[] = []
  tiomeoutID: number | undefined
  isActive: boolean = false
  moveStoppers: MoveStoppers
  
  constructor(root: HTMLDivElement) {
    this.canvas = root.appendChild(document.createElement('canvas'));
    this.canvas.width = this.canvas.height = 832;
    this.canvas.style.border = '1px solid #000';
    this.canvas.style.background = "#000";
    this.ctx = this.canvas.getContext('2d')!;
    this.isActive = true;
    this.tiomeoutID = setTimeout(this.render.bind(this), 16)
  }

  add(drawOptions: DrawOptions) {
    this.drawStack.push(drawOptions)
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const item of this.drawStack) {
      this.ctx.drawImage(
        sprite,
        item.spriteX,
        item.spriteY,
        item.spriteWidth,
        item.spriteHeight,
        item.canvasX,
        item.canvasY,
        item.spriteWidth,
        item.spriteHeight
      );
    }
    this.drawStack = [];
    if (this.isActive) {
      this.tiomeoutID = setTimeout(this.render.bind(this), 16);
    }
  }

  destroy() {
    if (this.tiomeoutID) {
      clearTimeout(this.tiomeoutID);
    }
    this.isActive = false;
    this.canvas.remove();
  }
}