// @ts-ignore
import Renderer from "../model/Renderer.ts";
// @ts-ignore
import { ObstacleCollection } from "../model/sampleObstacle.ts";
// @ts-ignore
import SampleTank from "../model/sampleTank.ts";
// @ts-ignore
import levels from "../view/levels.ts";

import {
  onTankMoveKeyPressFactory,
  onTankMoveKeyUpFactory
  // @ts-ignore
} from './eventListeners.ts';
// @ts-ignore
import { KeyController, KeyCallbackMap } from "./KeyController.ts";
// @ts-ignore
import { direction } from '../interfaces.ts';

export default function main() {
  const canvasRoot = document.createElement('div');
  canvasRoot.setAttribute('style', 'width: max-content; margin: auto; position: relative');
  document.body.appendChild(canvasRoot);

  // Debug table start
  // const debugTable = canvasRoot.appendChild(document.createElement('table'));
  // debugTable.appendChild(document.createElement('tbody'));
  // debugTable.cellSpacing = '0';
  // debugTable.cellPadding = '0';
  // debugTable.id = 'table';
  // debugTable.width = '834';
  // debugTable.style.height = '834px';
  // const grid = new Array(26).fill(0).map(x => new Array(26).fill(0));
  //   for (let y = 0; y < grid.length; y++) {
  //     const tr = debugTable.tBodies[0].appendChild(document.createElement('tr'));
  //     for (let x = 0; x < grid[y].length; x++) {
  //       const td = tr.appendChild(document.createElement('td'));
  //       td.innerHTML = `x: ${x}<br>y: ${y}`;
  //     }
  //   }
  // Debug table end

  const renderer = new Renderer(canvasRoot);
  Object.defineProperty(window, '_renderer', { 
    value: renderer,
    enumerable: true,
    configurable: true,
  });

  const testTank = new SampleTank({
    x: 263,
    y: 832 - 57,
    startDirection: 'up',
    isEnemy: false
  }, renderer);
  // const testTank1 = new SampleTank({
  //   x: 22,
  //   y: 422,
  //   startDirection: 'up',
  //   isEnemy: true
  // }, renderer);
  // const onKeyDownListener = onTankMoveKeyPressFactory(testTank);
  const onKeyUpListener = onTankMoveKeyUpFactory(testTank);

  // window.addEventListener('keydown', onKeyDownListener);
  window.addEventListener('keyup', onKeyUpListener);

  // Create test obstacles

  const obstacleCollection = new ObstacleCollection(renderer, levels['1']);

  Object.defineProperty(window, '_obstacleCollection', { 
    value: obstacleCollection,
    enumerable: true,
    configurable: true,
  });
}

//   let shoot: string = testTank.startDirection
//   function getshootDirection(direction: string) {
//     if (shoot == 'up') {
//       return { x: testTank.dx + 20, y: testTank.dy - 35 }
//     }
//     if (shoot == 'down') {
//       return { x: testTank.dx + 25, y: testTank.dy + 25 }
//     }
//     if (shoot == 'left') {
//       return { x: testTank.dx, y: testTank.dy - 10 }
//     }
//     if (shoot == 'right') {
//       return { x: testTank.dx + 50, y: testTank.dy - 10 }
//     }
//   }

//   console.log(testTank)
//   window.addEventListener('keydown', (e) => {
//     if (e.code == 'Space') {
//       const bullet = new Bullet(getshootDirection(shoot), renderer).move(shoot)
//     }
//   })
// }
