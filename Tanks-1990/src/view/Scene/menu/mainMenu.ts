// @ts-ignore
import "./menu.scss";

const menu = `
<div class='wrapper'>
<img class='titleImg' src='/public/img/battle_city.png'>
<div class='menuWrapper'>
<div class='tank'>
<img class='tankImg sprite menu-tank' src='data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 52 52" width="52" height="52"><rect fill="none" stroke="none" width="52" height="52" /></svg>'>
</div>
<div>
<p class='start'>START</p>
<p class='setting'>SCORE</p>
<p class='help'>HELP</p>
</div>
</div>
<div class='footer'>
<div class='github'>
<img class='ghLogo' src='https://raw.githubusercontent.com/gist/theAdityaNVS/f5b585d1082da2dffffea32434f37956/raw/7f9552d0a179b4f84059259fa878199e369b069c/GitHub-logo.gif'>
<img class='click' src='https://i.pixelspeechbubble.com/7Svuvuuv/pixel-speech-bubble.png'>
</div>
<img class='ghprofile1' src="https://avatars.githubusercontent.com/u/90145322?v=4">
<img class='ghprofile2' src="https://avatars.githubusercontent.com/u/106067344?v=4">
<img class='ghprofile3' src="https://avatars.githubusercontent.com/u/60061707?v=4">
<img class='rsschool' src="https://i.ibb.co/G5J49YW/rsschool.png">
</div>
</div>
`

function tankPosition() {
  let tank = document.querySelector('.tankImg') as HTMLImageElement
  let tankpos = 0
  let margin = 0
  window.addEventListener('keydown', function(e){
if(tankpos <=1 && e.keyCode == 83){
  margin += 62
  tank.style.marginTop = margin+'px'
  tankpos++
}
if(tankpos > 0 && e.keyCode == 87){
  margin -= 62
  tank.style.marginTop = margin+'px'
  tankpos--
}
if(e.keyCode == 13 && margin == 0){
    this.location.hash = 'stage'
  }
  if(e.keyCode == 13 && margin == 62){
    this.location.hash = 'score'
  }
  if(e.keyCode == 13 && margin >62){
    this.location.hash = 'help'
  }
  })
}

export function renderMenu() {
  if(location.hash == '#menu'){
    document.body.innerHTML = menu
    tankPosition() 
    const ghLogo = document.querySelector('.ghLogo') as HTMLImageElement;
    ghLogo.addEventListener('click', ()=>{
  window.open('https://github.com/Slimmzzz/Tanks-1990');
});
const rsschool = document.querySelector('.rsschool') as HTMLImageElement;
    rsschool.addEventListener('click', ()=>{
  window.open('https://rs.school/js/')
});
const ghprofile1 = document.querySelector('.ghprofile1') as HTMLImageElement;
    ghprofile1.addEventListener('click', ()=>{
  window.open('https://github.com/Slimmzzz')
});
const ghprofile2 = document.querySelector('.ghprofile2') as HTMLImageElement;
    ghprofile2.addEventListener('click', ()=>{
  window.open('https://github.com/lickoneyou')
});
const ghprofile3 = document.querySelector('.ghprofile3') as HTMLImageElement;
    ghprofile3.addEventListener('click', ()=>{
  window.open('https://github.com/wasek07')
});
  } else{
    document.body.innerHTML = '<div></div>'
  }
}
