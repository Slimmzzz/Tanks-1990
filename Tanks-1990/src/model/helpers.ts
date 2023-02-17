import { direction } from "../interfaces"
import Renderer from "./Renderer"

export interface FakeCreature {
  dx: number
  dy: number
  width: number
  height: number
  renderer: Renderer
}

export function collidesWithCanvasBoundaries(creature: FakeCreature, direction: direction) {
  if ((creature.dx < 0 && direction === 'left')
    || (creature.dx > creature.renderer.canvas.width - creature.width && direction === 'right') 
    || (creature.dy < 0 && direction === 'up')
    || (creature.dy >= creature.renderer.canvas.height - creature.height && direction === 'down')
  ) {
    return true;
  }
  return false;
}