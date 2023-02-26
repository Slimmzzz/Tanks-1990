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
// @ts-ignore
import { stageRender } from './view/Scene/stage/stage.ts';
// @ts-ignore
import { lvlScore } from './view/Scene/lvlScore/lvlScore.ts';

appendCssSprite()

export const Globals = {
  isGameOver: true,
  currentLevel: 1,
  scoreLevel: 0,
  scoreGame: 0,
  highScore: Number(window.localStorage.getItem('highScore')) || 20000,
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
// Globals.audio.level.volume = 0.6;
Globals.audio.level.loop = true;
for (const sound of Object.values(Globals.audio)) {
  sound.volume = 0.1;
}

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
  // if(location.hash =='#test'){
  //   lvlScore(0, Globals.currentLevel, Globals.scoreLevel)
  // }
  if (location.hash == '#menu') {
    renderMenu();
  }
  if (location.hash == '#stage') {
    renderMenu();
    stageRender(Globals.currentLevel)
    setTimeout(() => {
       main();
    addSizeBar();
    updateEnemy(Game.enemiesCount);
    }, 2000);
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

document.addEventListener('ui:game-over', (e) => {
  const { score, enemiesKilledByScore } = (<CustomEvent>e).detail;

  console.log(enemiesKilledByScore);
  lvlScore(Globals.highScore, Globals.currentLevel, score, enemiesKilledByScore)
  Globals.currentLevel+= 1
  Globals.scoreGame += score

})

  // TODO использовать score и enemiesKilledByScore в статистике

// window.addEventListener('keydown', (e)=>{
//   if (e.keyCode == 70) {
//     removeHealth()
//   }
// })

const ghLogo = document.querySelector('.ghLogo') as HTMLImageElement;
  
ghLogo.addEventListener('click', ()=>{
  window.open('https://github.com/Slimmzzz/Tanks-1990')
})
