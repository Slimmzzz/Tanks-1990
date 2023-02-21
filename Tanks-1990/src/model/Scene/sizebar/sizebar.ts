// @ts-ignore
import { gameOver } from "../gameOver/gameOver.ts";
// @ts-ignore
import "./sizebar.scss";

const sizeBar = `
<div class='enemy'></div>
<div class='lives'>
<p class='player'>IP</p>
<div class='playerLives'>
<img class='health' src='/src/model/Scene/img/lives.png'>
<p class='healthCounter'>3</p>
</div>
</div>
<div class='stage'>
<img class='flag' src='/src/model/Scene/img/flag.png'>
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

export function addEnemy(num: number){
  let enemy = document.querySelector('.enemy') as HTMLElement
  let enemyArray =[]
  for (let i = 0; i < num; i++) {
    enemyArray.push(`<img src='/src/model/Scene/img/enemy.png'>`)
  }
  enemy.innerHTML = enemyArray.join('')
}

export function removeOneEnemy() {
  let enemy = document.querySelector('.enemy') as HTMLElement
  addEnemy(enemy.childElementCount-1)
}

export function addHealth(){
  let health = document.querySelector('.healthCounter') as HTMLElement
health.innerText = `${+health.innerText + 1}`
}

export function removeHealth(){
  let health = document.querySelector('.healthCounter') as HTMLElement
  if(health.innerText != '0'){
    health.innerText = `${+health.innerText - 1}`
  }
  if(health.innerText == '0'){
    gameOver()
  }
}

export function addStage(){
  let stage = document.querySelector('.stageCounter') as HTMLElement
  stage.innerText = `${+stage.innerText + 1}`
}

