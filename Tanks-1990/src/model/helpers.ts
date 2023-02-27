import { direction, dynamicObjectsKey } from '../interfaces';
import Renderer from "./Renderer"
// @ts-ignore
import { Obstacle } from "./sampleObstacle.ts"
// @ts-ignore
import { spriteMap } from '../view/sprite.ts';

export interface FakeCreature {
  id: number
  dx: number
  dy: number
  width: number
  height: number
  renderer: Renderer
  speed: number
}

/** Рендерит количество очков за убитый танк или подобранный бонус.
 * Находится в общих хелперах, т.к. используется с инстансами разных классов
 */
export function renderScore(creature: FakeCreature, score: number) {
  let i = 0;
  let timeout = 0;
  const drawScoreCallback = () => {
    creature.renderer.add({
      spriteX: spriteMap.scores[`score${score}`].x,
      spriteY: spriteMap.scores[`score${score}`].y,
      spriteWidth: 64,
      spriteHeight: 64,
      canvasWidth: 64,
      canvasHeight: 64,
      canvasX: creature.dx,
      canvasY: creature.dy,
    });
    if (i < 60) {
      i += 1;
      timeout = setTimeout(drawScoreCallback, 16);
    } else {
      clearTimeout(timeout);
    }
  }
  drawScoreCallback();
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

export function collidesWithObstacles(creature: FakeCreature, direction: direction) {
  let maybeObstacles = [];
  const matrix = creature.renderer.obstacleCoordsMatrix;
  if (direction === 'up') {
    const LookupY = Math.floor(creature.dy / 32);
    const LookupXLeft = Math.floor((creature.dx + 1) / 32);
    const LookupXRight = Math.floor((creature.dx + creature.width - 1) / 32);
    
    if (matrix[LookupY][LookupXLeft] instanceof Obstacle) {
      maybeObstacles.push(matrix[LookupY][LookupXLeft]);
    }
    if (matrix[LookupY][LookupXRight] instanceof Obstacle) {
      maybeObstacles.push(matrix[LookupY][LookupXRight]);
    }
    if (LookupXRight - LookupXLeft > 1) {
      if (matrix[LookupY][LookupXLeft + 1] instanceof Obstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXLeft + 1]);
      }
    }
  } else if (direction === 'down') {
    const LookupY = Math.floor((creature.dy + creature.height) / 32);
    const LookupXLeft = Math.floor((creature.dx + 1) / 32);
    const LookupXRight = Math.floor((creature.dx + creature.width - 1) / 32);

    if (matrix[LookupY][LookupXLeft] instanceof Obstacle) {
      maybeObstacles.push(matrix[LookupY][LookupXLeft]);
    }
    if (matrix[LookupY][LookupXRight] instanceof Obstacle) {
      maybeObstacles.push(matrix[LookupY][LookupXRight]);
    }
    if (LookupXRight - LookupXLeft > 1) {
      if (matrix[LookupY][LookupXLeft + 1] instanceof Obstacle) {
        maybeObstacles.push(matrix[LookupY][LookupXLeft + 1]);
      }
    }
  } else if (direction === 'left') {
    const lookupX = Math.floor(creature.dx / 32);
    const lookupYUp = Math.floor((creature.dy + 1) / 32);
    const lookupYDown = Math.floor((creature.dy + creature.height - 1) / 32);

    if (matrix[lookupYUp][lookupX] instanceof Obstacle) {
      maybeObstacles.push(matrix[lookupYUp][lookupX]);
    }
    if (matrix[lookupYDown][lookupX] instanceof Obstacle) {
      maybeObstacles.push(matrix[lookupYDown][lookupX]);
    }
    if (lookupYDown - lookupYUp > 1) {
      if (matrix[lookupYUp + 1][lookupX] instanceof Obstacle) {
        maybeObstacles.push(matrix[lookupYUp + 1][lookupX]);
      }
    }
  } else if (direction === 'right') {
    
    const lookupX = Math.floor((creature.dx + creature.width) / 32);
    const lookupYUp = Math.floor((creature.dy + 1) / 32);
    const lookupYDown = Math.floor((creature.dy + creature.height - 1) / 32);
    if (matrix[lookupYUp][lookupX] instanceof Obstacle) {
      maybeObstacles.push(matrix[lookupYUp][lookupX]);
    }
    if (matrix[lookupYDown][lookupX] instanceof Obstacle) {
      maybeObstacles.push(matrix[lookupYDown][lookupX]);
    }
    if (lookupYDown - lookupYUp > 1) {
      if (matrix[lookupYUp + 1][lookupX] instanceof Obstacle) {
        maybeObstacles.push(matrix[lookupYUp + 1][lookupX]);
      }
    }
  }

  if (maybeObstacles.length) {
    return maybeObstacles;
  }
  return false;
}

export function collidesWithDynamicObject(creature: FakeCreature, direction: direction, whatToCheck: dynamicObjectsKey) {
  const arrayToCheck = creature.renderer[whatToCheck];
  
  let possiblyCreature = undefined;
  for (const otherCreature of arrayToCheck) {
    if (otherCreature.id !== creature.id) {
      if (direction === 'up') {
        if (creature.dy < otherCreature.dy + otherCreature.height + 1 &&
          creature.dy > otherCreature.dy) {
          if (creature.dx === otherCreature.dx || (creature.dx > otherCreature.dx &&
            creature.dx < otherCreature.dx + otherCreature.width) ||
            (creature.dx + creature.width > otherCreature.dx &&
              creature.dx + creature.width < otherCreature.dx + otherCreature.width)
            ) {
            possiblyCreature = otherCreature;
            break;
          }
        }
      } else if (direction === 'down') {
        if (creature.dy + creature.height > otherCreature.dy - 1 &&
          creature.dy + creature.height < otherCreature.dy + otherCreature.height) {
          if (
            creature.dx === otherCreature.dx ||
            (creature.dx > otherCreature.dx &&
              creature.dx < otherCreature.dx + otherCreature.width) ||
              (creature.dx + creature.width > otherCreature.dx &&
                creature.dx + creature.width < otherCreature.dx + otherCreature.width) 
                // ||
                // (creature.width < otherCreature.width &&
                //   (creature.dx > otherCreature.dx &&
                //     creature.dx + creature.width < otherCreature.dx + otherCreature.width) )
          ) {
            possiblyCreature = otherCreature;
            break;
          }
        }
      } else if (direction === 'left') {
        if (creature.dx < otherCreature.dx + otherCreature.width + 1 &&
          creature.dx > otherCreature.dx) {
          if (
            creature.dy === otherCreature.dy ||
            (creature.dy > otherCreature.dy &&
              creature.dy < otherCreature.dy + otherCreature.height) ||
            (creature.dy + creature.height > otherCreature.dy &&
              creature.dy + creature.height < otherCreature.dy + otherCreature.height)
          ) {
            possiblyCreature = otherCreature; 
            break;
          }
        }
      } else if (direction === 'right') {
        if (creature.dx + creature.width > otherCreature.dx - 1 &&
          creature.dx + creature.width < otherCreature.dx + otherCreature.width) {
          if (
            creature.dy === otherCreature.dy ||
            (creature.dy > otherCreature.dy &&
              creature.dy < otherCreature.dy + otherCreature.height) ||
            (creature.dy + creature.height > otherCreature.dy &&
              creature.dy + creature.height < otherCreature.dy + otherCreature.height)
          ) {
            possiblyCreature = otherCreature; 
            break;
          }
        }
      }
    }
  }
  
  return possiblyCreature;
}