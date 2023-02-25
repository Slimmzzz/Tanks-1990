// @ts-ignore
import { Globals } from "../../../app.ts";
// @ts-ignore
import { gameOver } from "../gameOver/gameOver.ts";
// @ts-ignore
import { lvlScore } from "../lvlScore/lvlScore.ts";
// @ts-ignore
import "./sizebar.scss";

const sizeBar = `
<div class='enemy'></div>
<div class='lives'>
<p class='player'>IP</p>
<div class='playerLives'>
<span class="sprite is-32 player-tank" style="width: 28px; transform: scale(0.75);"></span>
<p class='healthCounter'>2</p>
</div>
</div>
<div class='stage'>
<span class="sprite is-64 flag"></span>
<p class='stageCounter'>1</p>
</div>
`

export function addSizeBar() {
  document.body.style.display = 'flex'
  let bar = document.createElement('div')
  bar.classList.add('bar')
  bar.innerHTML = sizeBar
  document.body.appendChild(bar)
}

export function updateEnemy(num: number){
  let enemy = document.querySelector('.enemy') as HTMLElement
  let enemyArray =[]
  for (let i = 0; i < num; i++) {
    // enemyArray.push(`<img src='/src/view/Scene/img/enemy.png'>`)
    enemyArray.push(`<span class="sprite is-32 enemy-tank"></span>`)
  }
  enemy.innerHTML = enemyArray.join('')
}

export function setHealth(hp: number) {
  let health = document.querySelector('.healthCounter') as HTMLElement;
  health.innerText = `${hp}`;
  if(hp == 0) {
    gameOver()
  }
}

export function addStage() {
  let stage = document.querySelector('.stageCounter') as HTMLElement
  stage.innerText = `${+stage.innerText + 1}`
}

