// @ts-ignore
import SampleTank from "../model/sampleTank.ts";

export function onTankMoveKeyPressFactory(tank: SampleTank) {
  return function onTankMoveKeyPress(e: KeyboardEvent) {
    if (!tank.isMoving) {
      tank.isMoving = true;

      if (e.key === 'd') {
        tank.move('right');
      } else if (e.key === 'a') {
        tank.move('left');
      } else if (e.key === 'w') {
        tank.move('up');
      } else if (e.key === 's') {
        tank.move('down');
      }
    }
  }
}

export function onTankMoveKeyUpFactory(tank: SampleTank) {
  return function onTankMoveKeyUp(e: KeyboardEvent) {
    if (['w', 'a', 's', 'd'].includes(e.key)) {
      tank.isMoving = false;
      tank.stop();
    }
  }
}