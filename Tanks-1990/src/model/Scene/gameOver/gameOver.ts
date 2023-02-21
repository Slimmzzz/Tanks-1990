// @ts-ignore
import { renderMenu } from '../menu/mainMenu.ts'
// @ts-ignore
import './gameOver.scss'

export function gameOver() {
  let gameOverPic = document.createElement('div')
  gameOverPic.classList.add('gameOver')
  gameOverPic.innerHTML = `
<img class='gameOverImg' src='/src/model/Scene/img/game_over.png'>
`
  document.body.appendChild(gameOverPic)
  let gameOverImg = document.querySelector('.gameOverImg') as HTMLElement
  setTimeout(function () {
    gameOverImg.style.transform = 'translateY(-660px)'
  }, 100)
  setTimeout(() => {
    location.hash = '#menu'
    renderMenu()
  }, 3500)
}
