// @ts-ignore
import "./help.scss";

const helpMenu = `
<div class='helpWrapper'>
<div class='keyButtoms'>
<div class='WASD'>W</div>
<div class='WASD'>A</div>
<div class='WASD'>S</div>
<div class='WASD'>D</div>
<div class='space'>SPACE</div>
<div class='enter'>ENTER</div>
</div>
<div>
<div class='arrow'>--></div>
<div class='arrow'>--></div>
<div class='arrow'>--></div>
<div class='arrow'>--></div>
<div class='arrow'>--></div>
<div class='arrow'>--></div>
</div>
<div class='buttonsDescription'>
<div class='description'>Move Up</div>
<div class='description'>Move LEFT</div>
<div class='description'>Move DOWN</div>
<div class='description'>Mowe Right</div>
<div class='description'>File</div>
<div class='description'>Confirm</div>
</div>
<div class='helpBack'>PRESS ENTER TO BACK</div>
</div>
`

export function help() {
  document.body.innerHTML = helpMenu
  window.addEventListener('keydown', function(e){
    if(location.hash == '#help' && e.keyCode == 13){
location.hash = '#menu'
location.reload()
    }
  })
}