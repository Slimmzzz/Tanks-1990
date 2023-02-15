// @ts-ignore
import Tank from './sampleTank.ts';
// @ts-ignore
import { direction } from '../interfaces.ts';

function turnLeft(direction: direction) {
  return direction === 'up' ? 'left' :
  direction === 'left' ? 'down' :
  direction === 'down' ? 'right' : 'up';
}

function turnRight(direction: direction) {
  return direction === 'up' ? 'right' :
  direction === 'right' ? 'down' :
  direction === 'down' ? 'left' : 'up';
}

function changeDirection(tank: Tank) {
  let directions: direction[] = ['left', 'right', 'up', 'down'];
  directions.splice(directions.findIndex(d => d === tank.direction), 1);

  let random = Math.random();
  let downChance = random > 0.3;
  
  if (directions.indexOf('down') !== -1) {
    if (downChance) {
      return 'down';
    }
  }
  
  random = Math.random();
  let leftChance = tank.dx > 400 ? random > 0.2 : random > 0.8;
  
  if (directions.indexOf('left') !== -1) {
    if (leftChance) {
      return 'left';
    }
  }

  random = Math.random();
  let rightChance = tank.dx > 400 ? random > 0.8 : random > 0.2;
  
  if (directions.indexOf('right') !== -1) {
    if (rightChance) {
      return 'right';
    }
  }

  return directions[Math.floor(Math.random() * directions.length)];
}

export default function enemyBehaviour(tank: Tank) {
  const moveCallback = () => {
    let canMove = tank.checkCollisions(tank.direction);
    if (!canMove) {
      tank.shiftCallback(tank.direction, canMove);
      tank.direction = changeDirection(tank);
    }

    let randomTurnChance = Math.random() > 0.98;
    if (randomTurnChance) {
      let possibleDirection = Math.random() > 0.5 ? turnLeft(tank.direction) : turnRight(tank.direction);
      let fakeTank = {
        dx: tank.dx,
        dy: tank.dy,
        tankWidth: tank.tankWidth,
        tankHeight: tank.tankHeight,
        renderer: tank.renderer
      };
      let metObstacleOnWay = false;
      switch (possibleDirection) {
        case 'right': {
          for (let i = 1; i < 100; i++) {
            if (!(tank.checkCollisions.call(fakeTank, possibleDirection, false))) {
              metObstacleOnWay = true;
              break;
            } else {
              fakeTank.dx = fakeTank.dx + 1;
            }
          }
          break;
        }
        case 'left': {
          for (let i = 1; i < 100; i++) {
            if (!(tank.checkCollisions.call(fakeTank, possibleDirection, false))) {
              metObstacleOnWay = true;
              break;
            } else {
              fakeTank.dx = fakeTank.dx - 1;
            }
          }
          break;
        }
        case 'up': {
          for (let i = 1; i < 100; i++) {
            if (!(tank.checkCollisions.call(fakeTank, possibleDirection, false))) {
              metObstacleOnWay = true;
              break;
            } else {
              fakeTank.dy = fakeTank.dy - 1;
            }
          }
          break;
        }
        case 'down': {
          for (let i = 1; i < 100; i++) {
            if (!(tank.checkCollisions.call(fakeTank, possibleDirection, false))) {
              metObstacleOnWay = true;
              break;
            } else {
              fakeTank.dy = fakeTank.dy + 1;
            }
          }
          break;
        }
      }
      if (!metObstacleOnWay) {
        tank.direction = possibleDirection;
      }
    }
    // let possibleLeftDirection = tank.direction === 'up' ? 'left' :
    //   tank.direction === 'left' ? 'down' :
    //   tank.direction === 'down' ? 'right' : 'up';

    // let canTurnLeft = tank.checkCollisions(possibleLeftDirection);
    // if (canTurnLeft) {
    //   let turnLeftChance = Math.random() > 0.9;
    //   if (turnLeftChance) {
    //     tank.direction = possibleLeftDirection;
    //   }
    // }

    // let possibleRightDirection = tank.direction === 'up' ? 'right' :
    //   tank.direction === 'right' ? 'down' :
    //   tank.direction === 'down' ? 'left' : 'up';

    // let canTurnRight = tank.checkCollisions(possibleRightDirection);
    // if (canTurnRight) {
    //   let turnRightChance = Math.random() > 0.9;
    //   if (turnRightChance) {
    //     tank.direction = possibleRightDirection;
    //   }
    // }
    
    tank.move(tank.direction);
    tank._aiTimeout = setTimeout(moveCallback, 16);
  }
  tank._aiTimeout = setTimeout(moveCallback, 16);
}