// @ts-ignore
import "./stage.scss";

export function stageRender(stage: number) {
  document.body.innerHTML  = `
  <div class='stageWraper'>
  <p class='stageTittle'>Stage ${stage}</p>
  </div>
  `
  let stageWraper = document.querySelector('.stageWraper') as HTMLElement
stageWraper.style.display = 'flex'
  setTimeout(() => {
    stageWraper.style.display = 'none'
  }, 2000);
}