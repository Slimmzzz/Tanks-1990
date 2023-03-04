import './style.scss';
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
// @ts-ignore
import { renderScoreMenu } from './view/Scene/score/score.ts';

appendCssSprite()

export const Globals = {
  playerLives: 2,
  playerLevel: 1,
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
Globals.audio.level.loop = true;
for (const sound of Object.values(Globals.audio)) {
  sound.volume = 0.1;
}

let game: Game | undefined;
location.hash = 'menu';
renderMenu();

window.addEventListener('hashchange', () =>{
  if (location.hash == '#menu') {
    renderMenu();
  }
  if (location.hash == '#stage') {
    stageRender(Globals.currentLevel);
    setTimeout(() => {
      addSizeBar(Globals.currentLevel);
      updateEnemy(Game.enemiesCount);
      game = new Game();
    }, 2000);
  } 
  if(location.hash == '#score'){
    renderScoreMenu(Globals.highScore);
  }
  if(location.hash == '#help') {
    help();
  }
});

let gameState;
if (gameState = window.localStorage.getItem('GameState')) {
  gameState = JSON.parse(gameState);
  for (const key in gameState) {
    // @ts-ignore
    Globals[key] = gameState[key];
  }
  location.hash = '#stage';
}

document.addEventListener('ui:remove-enemy-tank', (e) => {
  const { tanks } = (<CustomEvent>e).detail;
  updateEnemy(tanks);
});

document.addEventListener('ui:update-health', (e) => {
  const { health } = (<CustomEvent>e).detail;
  setHealth(health);
  Globals.playerLives = health;
});

document.addEventListener('ui:game-over', (e) => {
  const { score, enemiesKilledByScore } = (<CustomEvent>e).detail;
  Globals.audio.gameOver.play();
  game!.destroyLevel().then(() => {
    game = undefined;
    Globals.scoreGame += score;
    if (Globals.scoreGame > Globals.highScore) {
      window.localStorage.setItem('highScore', String(Globals.scoreGame));
    }
    window.localStorage.removeItem('GameState');

    lvlScore(Globals.highScore, Globals.currentLevel, Globals.scoreGame, enemiesKilledByScore).then(() => {
      location.hash = '#menu';
      location.reload();
    });
  });
});

document.addEventListener('ui:complete-level', (e) => {
  const { score, enemiesKilledByScore } = (<CustomEvent>e).detail;
  game!.destroyLevel().then(() => {
    game = undefined;
    Globals.scoreGame += score;
    Globals.currentLevel +=1
    window.localStorage.setItem('GameState', JSON.stringify({
      currentLevel: Globals.currentLevel,
      scoreGame: Globals.scoreGame,
      playerLives: Globals.playerLives,
      playerLevel: Globals.playerLevel,
    }));
    
    lvlScore(Globals.highScore, Globals.currentLevel, Globals.scoreGame, enemiesKilledByScore).then(() => {
      location.hash = '#menu';
      location.reload();
    });
  });
});