// @ts-ignore
import "./menu.scss";

const menu = `
<div class='wrapper'>
<img class='titleImg' src='/src/view/Scene/img/battle_city.png'>
<div class='menuWrapper'>
<div class='tank'>
<img class='tankImg' src='/src/view/Scene/img/tank.png'>
</div>
<div>
<p class='start'>START</p>
<p class='setting'>SETTING</p>
<p class='help'>HELP</p>
</div>
</div>
<div>
<img class='ghLogo' src='https://raw.githubusercontent.com/gist/theAdityaNVS/f5b585d1082da2dffffea32434f37956/raw/7f9552d0a179b4f84059259fa878199e369b069c/GitHub-logo.gif'>
</div>
</div>
`

function tankPosition() {
  let tank = document.querySelector('.tankImg') as HTMLImageElement
  let tankpos = 0
  let margin = 0
  window.addEventListener('keydown', function(e){
if(tankpos <=1 && e.keyCode == 83){
  margin += 32
  tank.style.marginTop = margin+'px'
  tankpos++
}
if(tankpos > 0 && e.keyCode == 87){
  margin -= 32
  tank.style.marginTop = margin+'px'
  tankpos--
}
if(e.keyCode == 13 && margin == 0){
    this.location.hash = 'stage'
  }
  if(e.keyCode == 13 && margin == 32){
    this.location.hash = 'setting'
  }
  if(e.keyCode == 13 && margin >32){
    this.location.hash = 'help'
  }
  })
}

export function renderMenu() {
  if(location.hash == '#menu'){
document.body.innerHTML = menu
  tankPosition() 
  } else{
    document.body.innerHTML = '<div></div>'
  }
}

