// @ts-ignore
import Game from "./Game.ts";

export const Globals = {
  isGameOver: true,
  currentLevel: 1,
  scoreLevel: 0,
  scoreGame: 0,
  highScore: Number(window.localStorage.getItem('highScore')) || 20000,
  activeView: {
    startScreen: true,
    stageScreen: false,
    statsScreen: false,
  },
  audio: {
    gameStart: new Audio('/public/sounds/start-level.mp3'),
    gameOver: new Audio('/public/sounds/game-over.mp3'),
    hitBorder: new Audio('/public/sounds/hitting-the-border-map.mp3'),
    hitEagle: new Audio('/public/sounds/hitting-the-eagle.mp3'),
    level: new Audio('/public/sounds/level.mp3'),
    takeBonus: new Audio('/public/sounds/open-bonus.mp3'),
    pause: new Audio('/public/sounds/pause-level.mp3'),
    shot: new Audio('/public/sounds/shot.mp3'),
    tankDamage: new Audio('/public/sounds/tank-damage.mp3'),
  }
}
Globals.audio.level.volume = 0.6;
Globals.audio.level.loop = true;

export default function main() {
  new Game();
}

/* export default function main() {
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
  

  const testTank = new Tank({
    id: 1,
    x: 263,
    y: 832 - 57,
    startDirection: 'up',
    isEnemy: false
  }, renderer);
  const testTank1 = new Tank({
    id: 2,
    x: 2,
    y: 2,
    startDirection: 'down',
    isEnemy: true,
    tankType: 'enemy1',
    tankColor: 'grey',
    tankModelWidth: spriteMap.tanks.enemy1.width,
    tankModelHeight: spriteMap.tanks.enemy1.height,
    // ignoreAIBehaviour: true,
  }, renderer);
  const testTank2 = new Tank({
    id: 3,
    x: 832 - 60,
    y: 2,
    startDirection: 'left',
    isEnemy: true,
    tankType: 'enemy1',
    tankColor: 'grey',
    tankModelWidth: spriteMap.tanks.enemy1.width,
    tankModelHeight: spriteMap.tanks.enemy1.height
  }, renderer);
  const testTank3 = new Tank({
    id: 4,
    x: (832 - 60) / 2,
    y: 2,
    startDirection: 'right',
    isEnemy: true,
    tankType: 'enemy1',
    tankColor: 'grey',
    tankModelWidth: spriteMap.tanks.enemy1.width,
    tankModelHeight: spriteMap.tanks.enemy1.height
  }, renderer);
  // const onKeyDownListener = onTankMoveKeyPressFactory(testTank);
  const onKeyUpListener = onTankMoveKeyUpFactory(testTank);

  // window.addEventListener('keydown', onKeyDownListener);
  window.addEventListener('keyup', onKeyUpListener);

  // Create test obstacles

  const obstacleCollection = new ObstacleCollection(renderer, levels['4']);

} 

*/

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
