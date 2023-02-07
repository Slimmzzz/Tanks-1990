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

export default function main() {
  const canvasRoot = document.createElement('div');
  canvasRoot.setAttribute('style', 'width: max-content; margin: auto');
  document.body.appendChild(canvasRoot);
  const renderer = new Renderer(canvasRoot);
  Object.defineProperty(window, '_renderer', { 
    value: renderer,
    enumerable: true,
    configurable: true,
  });

  //Нужно учитывать, что длина/ширина canvas равна 65*13, максимально 
  //возможное положение танка = длина canvas - ширина танка(845 - 65)
  const testTank = new SampleTank({
    x: 832 - 64,
    y: 0,
    startDirection: 'left',
    isEnemy: false
  }, renderer);
  // const testTank1 = new SampleTank({
  //   x: 22,
  //   y: 422,
  //   startDirection: 'up',
  //   isEnemy: true
  // }, renderer);
  const onKeyDownListener = onTankMoveKeyPressFactory(testTank);
  const onKeyUpListener = onTankMoveKeyUpFactory(testTank);

  window.addEventListener('keydown', onKeyDownListener);
  window.addEventListener('keyup', onKeyUpListener);

  // Create test obstacles

  const obstacleCollection = new ObstacleCollection(renderer, levels['1']);

  Object.defineProperty(window, '_obstacleCollection', { 
    value: obstacleCollection,
    enumerable: true,
    configurable: true,
  });
}