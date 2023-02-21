import './style.scss';
// @ts-ignore
import main from "./controller/controller.ts";
// @ts-ignore
import { renderMenu } from './view/Scene/menu/mainMenu.ts';
// @ts-ignore
import { addSizeBar, updateEnemy, setHealth } from './view/Scene/sizebar/sizebar.ts';
// @ts-ignore
import { help } from './view/Scene/help/help.ts';
// @ts-ignore
import Game from './controller/Game.ts';
// @ts-ignore
import { appendCssSprite } from './view/sprite.ts';

appendCssSprite()

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

Object.defineProperty(window, '_globals', {
  enumerable: true,
  configurable: true,
  value: Globals
})

location.hash = 'menu';
renderMenu();

document.addEventListener('load', () => {
});
window.addEventListener('hashchange', () =>{
  if (location.hash == '#menu') {
    renderMenu();
  }
  if (location.hash == '#stage') {
    renderMenu();
    main();
    addSizeBar();
    updateEnemy(Game.enemiesCount);
  } 
  if(location.hash == '#help') {
    help();
  }
})

document.addEventListener('ui:remove-enemy-tank', (e) => {
  const { tanks } = (<CustomEvent>e).detail;
  updateEnemy(tanks);
})

document.addEventListener('ui:update-health', (e) => {
  const { health } = (<CustomEvent>e).detail;
  setHealth(health);
})
// window.addEventListener('keydown', (e)=>{
//   if (e.keyCode == 70) {
//     removeHealth()
//   }
// })