// @ts-ignore
import { Globals } from '../app.ts';
// @ts-ignore
import { Coords } from '../interfaces.ts';
// @ts-ignore
import { Eagle } from '../model/Eagle.ts';
// @ts-ignore
import Renderer from "../model/Renderer.ts";
// @ts-ignore
import { ObstacleCollection } from '../model/sampleObstacle.ts';
// @ts-ignore
import Tank from "../model/sampleTank.ts";
// @ts-ignore
import levels from '../view/levels.ts';
// @ts-ignore
import { spriteMap } from '../view/sprite.ts';
// @ts-ignore
import { onTankMoveKeyUpFactory } from './eventListeners.ts';

export default class Game {
  renderer: Renderer
  forestRenderer: Renderer
  level: ObstacleCollection
  currentTankId: number = 2
  currentPickupId: number = 1
  playerTank: Tank
  private enemyTankSpawns: Coords[] = [
    {x: 2, y: 2},
    {x: 832 - 60, y: 2},
    {x: (832-60) / 2, y: 2}
  ]
  spawnTankTimeout: number = 0;
  spawnTankCallback: () => void;
  playerLives: number = Globals.playerLives
  playerLevel: number = Globals.playerLevel
  forestInLevel: ObstacleCollection
  score: number = 0
  enemiesToGo: number = 20
  static enemiesCount: number = 20
  areEnemiesFreezed: boolean = false
  enemiesKilledByScore: {
    '100': number
    '200': number
    '300': number
    '400': number
  } = {
    '100': 0,
    '200': 0,
    '300': 0,
    '400': 0,
  }
  
  constructor() {
    Globals.isGameOver = false;
    const canvasRoot = document.createElement('div');
    canvasRoot.setAttribute('style', 'width: max-content; margin-left: auto; position: relative; border: 1px solid #EEE');
    document.body.appendChild(canvasRoot);
    this.renderer = new Renderer(canvasRoot);
    this.renderer.game = this;
    this.forestRenderer = new Renderer(canvasRoot, 'position: absolute; z-index: 2; top: 0; left: 50%; transform: translateX(-50%);');
    Globals.audio.gameStart.play();

    this.level = new ObstacleCollection(this.renderer, levels[`${(Globals.currentLevel)}`].map((row: string[]) => {
      return row.map((cell: string) => {
        return cell === 'f' ? '' : cell;
      })
    }));

    this.forestInLevel = new ObstacleCollection(this.forestRenderer, levels[`${(Globals.currentLevel)}`].map((row: string[]) => {
      return row.map((cell: string) => {
        return cell === 'f' ? cell : '';
      })
    }));

    new Eagle(this.renderer);

    this.playerTank = new Tank({
      id: 1,
      x: 263,
      y: 832 - 57,
      startDirection: 'up',
      isEnemy: false,
      speed: 1
    }, this.renderer);
    this.renderer.tanks.push(this.playerTank);

    if (this.playerLevel > 1) {
      for (let i = 0; i < this.playerLevel; i++) {
        this.playerTank.playerLevel += 1;
        this.playerTank.updatePlayerLevel();
      }
    }

    document.dispatchEvent(new CustomEvent('ui:update-health', {
      detail: {
        health: this.playerLives
      }
    }))
    
    for (const { x, y } of this.enemyTankSpawns) {
      const typeIndex: number = Math.ceil(Math.random() * 4);
      this.renderer.tanks.push(new Tank({
        id: this.currentTankId,
        x: x,
        y: y,
        startDirection: 'down',
        isEnemy: true,
        tankType: `enemy${typeIndex}`,
        tankColor: Math.random() > 0.4 ? 'grey' : Math.random() > 0.8 ? 'green' : 'red',
        tankModelWidth: spriteMap.tanks[`enemy${typeIndex}`].width,
        tankModelHeight: spriteMap.tanks[`enemy${typeIndex}`].height,
        hp: spriteMap.tanks[`enemy${typeIndex}`].hp || 1,
        speed: spriteMap.tanks[`enemy${typeIndex}`].speed || 1,
        killScore: spriteMap.tanks[`enemy${typeIndex}`].killScore,
      }, this.renderer));
      this.currentTankId += 1;
    }

    this.spawnTankCallback = () => {
      if (this.renderer.tanks.length >= 5) {
        clearTimeout(this.spawnTankTimeout);
        } else {
        this.tryToSpawnEnemyTank();
        this.spawnTankTimeout = setTimeout(this.spawnTankCallback, 80);
      }
    };
    this.spawnTankTimeout = setTimeout(this.spawnTankCallback, 80);
    
    document.addEventListener('game:unfreeze-enemies', () => {
      this.areEnemiesFreezed = false
      for (const tank of this.renderer.tanks) {
        if (tank.isEnemy) {
          tank.initEnemyBehavior();
        }
      }
    });

    const onKeyUpListener = onTankMoveKeyUpFactory(this.playerTank);
    window.addEventListener('keyup', onKeyUpListener);
  }

  tryToSpawnEnemyTank() {
    let spawns = [...this.enemyTankSpawns];
    spawns.sort((a, b) => Math.random() - 0.5);
    for (let { x, y } of spawns) {
      if (this.renderer.tanks.every((tank: Tank) => {
        return !(
          (tank.dx === x && tank.dy === y) ||
          (tank.dx > x && tank.dx < x + 60) ||
          (tank.dx + tank.width > x && tank.dx < x) ||
          (tank.dy < y && tank.dy + tank.heigth > y) ||
          (tank.dy > y && tank.dy < y + 60)
        );
      })) {
        const typeIndex: number = Math.ceil(Math.random() * 4);
        this.renderer.tanks.push(new Tank({
          id: this.currentTankId,
          x: x,
          y: y,
          startDirection: 'down',
          isEnemy: true,
          tankType: `enemy${typeIndex}`,
          tankColor: Math.random() > 0.4 ? 'grey' : Math.random() > 0.8 ? 'green' : 'red',
          tankModelWidth: spriteMap.tanks[`enemy${typeIndex}`].width,
          tankModelHeight: spriteMap.tanks[`enemy${typeIndex}`].height,
          hp: spriteMap.tanks[`enemy${typeIndex}`].hp || 1,
          speed: spriteMap.tanks[`enemy${typeIndex}`].speed || 1,
          killScore: spriteMap.tanks[`enemy${typeIndex}`].killScore,
        }, this.renderer));
        this.currentTankId += 1;
        break;
      }
    }
  }
  
  destroyLevel() {
    clearTimeout(this.spawnTankTimeout);
    return new Promise<void>((res) => {
      setTimeout(() => {
        [ 'tanks', 'pickups', 'bullets' ].forEach((key: string) => {
          const entitites = this.renderer[key];
          for (const entity of entitites) {
            entity.destroy();
          }
        });
        for (let y = 0; y < 26; y++) {
          for (let x = 0; x < 26; x++) {
            if (!!this.renderer.obstacleCoordsMatrix[y][x]) {
              this.renderer.obstacleCoordsMatrix[y][x].destroy();
            }
            if (!!this.forestRenderer.obstacleCoordsMatrix[y][x]) {
              this.forestRenderer.obstacleCoordsMatrix[y][x].destroy();
            }
          }
        }
        this.forestRenderer.destroy();
        this.renderer.destroy();
        this.forestRenderer = null;
        this.renderer = null;
        res();
      }, 3500)
    });
  }
}