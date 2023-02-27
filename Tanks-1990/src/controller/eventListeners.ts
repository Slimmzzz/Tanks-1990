// @ts-ignore
import Tank from "../model/sampleTank.ts";

export function onTankMoveKeyUpFactory(tank: Tank) {
  return function onTankMoveKeyUp(e: KeyboardEvent) {
    if (['w', 'a', 's', 'd'].includes(e.key)) {
      tank.isMoving = false;
      tank.stop();
    }
  }
}
