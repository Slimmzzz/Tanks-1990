// @ts-ignore
import "./score.scss";

export function renderScoreMenu(highScore:number) {
  document.body.innerHTML = `
<div class='scoreWrapper'>
<div class='bestScore'>
<p class='bestScoreTittle'>HI-SCORE</p>
<p class='score'>${highScore}</p>
</div>
<div class='scoreBack'>PRESS ENTER TO BACK</div>
</div>
`
  window.addEventListener('keydown', function(e){
    if(location.hash == '#score' && e.keyCode == 13){
location.hash = '#menu'
    }
  })
}