// @ts-ignore
import { Globals } from '../../../app.ts'
// @ts-ignore
import { scoreArray } from '../../../model/Bullet.ts'
// @ts-ignore
import { lvlScore } from '../lvlScore/lvlScore.ts'
// @ts-ignore
import { renderMenu } from '../menu/mainMenu.ts'
// @ts-ignore
import './gameOver.scss'

export function gameOver() {
  let gameOverPic = document.createElement('div')
  gameOverPic.classList.add('gameOver')
  gameOverPic.innerHTML = `
<span class="gameOverImg sprite game-over"></span>
`
  document.body.appendChild(gameOverPic)
  let gameOverImg = document.querySelector('.gameOverImg') as HTMLElement
  setTimeout(function () {
    gameOverImg.style.transform = 'translateY(-660px)'
  }, 100)
      setTimeout(()=>{
lvlScore(0, Globals.currentLevel, Globals.scoreLevel)
    }, 3500)
    setTimeout(() =>{
location.hash ='menu'
renderMenu()
    }, 10000)
}
