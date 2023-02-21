import './style.scss';
// @ts-ignore
import main from "./controller/controller.ts";
// @ts-ignore
import { renderMenu } from './model/Scene/menu/mainMenu.ts';
// @ts-ignore
import { addSizeBar } from './model/Scene/sizebar/sizebar.ts';
// @ts-ignore
import { addEnemy } from './model/Scene/sizebar/sizebar.ts';
// @ts-ignore
import { removeOneEnemy } from './model/Scene/sizebar/sizebar.ts';
// @ts-ignore
import { removeHealth } from './model/Scene/sizebar/sizebar.ts';
// @ts-ignore
import { help } from './model/Scene/help/help.ts';

location.hash = 'menu'
renderMenu()

document.addEventListener('load', () => {
});
window.addEventListener('hashchange', () =>{
  if(location.hash == '#menu'){
renderMenu()
  }
if(location.hash == '#stage'){
  renderMenu()
  main();
  addSizeBar()
  addEnemy(15)
} 
if(location.hash == '#help'){
  help()
}
  })

  window.addEventListener('keydown', (e)=>{
if(e.keyCode == 70){
removeHealth()
}
  })