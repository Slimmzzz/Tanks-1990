// @ts-ignore
import { spriteMap } from "../view/sprite.ts"
// @ts-ignore
import Renderer from './Renderer.ts';

export class Eagle {
  dx: number = 12 * 32
  dy: number = 24 * 32
  spriteX: number = spriteMap.eagle.alive.x
  spriteY: number = spriteMap.eagle.alive.y
  width: number = 64
  height: number = 64
  timeoutID: number;
  isAlive: boolean = true;
  renderer: Renderer;
  _pingRendererTimeoutCallback: () => void;
  spriteWidth: number = 64;
  spriteHeight: number = 64;


  constructor(renderer: Renderer) {
    this.renderer = renderer;
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
    this.renderer.eagle = this;
  }

  destroy() {
    clearTimeout(this.timeoutID);
    this.renderer.eagle = null;
  }
}