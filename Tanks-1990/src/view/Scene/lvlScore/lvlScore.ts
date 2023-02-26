// @ts-ignore
import { scoreArray } from '../../../model/Bullet.ts'
// @ts-ignore
import { renderMenu } from '../menu/mainMenu.ts'
// @ts-ignore
import './lvlScore.scss'

export function lvlScore(hiScore: number = 0, stage:number, scoreLevel: number, enemiesKilledByScore: object) {
  document.body.innerHTML = `
   <div class='lvlScoreWrapper'>
   <div class='hiScoreWrapper'>
<p class='hiScoreTittle'>HI-SCORE</p>
<p class='hiScoreScore'> ${hiScore}</p>
</div>
<p class='lvlStage'>Stage ${stage}</p>
<div class='currentScore'>
<p class='lvlScoreTittle'>Score</p>
<p class='lvlScoreCounter'>${scoreLevel}</p>
</div>
<div class='allPTS'>
<div class='PTS'>
<p class='PTsEnemyTanks1'>0 PTS</p>
<p class='PTsEnemyTanks2'>0 PTS</p>
<p class='PTsEnemyTanks3'>0 PTS</p>
<p class='PTsEnemyTanks4'>0 PTS</p>
</div>
<div class='tanksTotal'>
<p class='firstTank'>0</p>
<p class='secondTank'>0</p>
<p class='thirdTank'>0</p>
<p class='fourthTank'>0</p>
</div>
<div class='PTSArrow'>
<p class='PTSArrow1'><-</p>
<p class='PTSArrow2'><-</p>
<p class='PTSArrow3'><-</p>
<p class='PTSArrow4'><-</p>
</div>
<div class='enemyTank'>
<img class='firstTankImg' src='/src/view/Scene/img/basic.png'>
<img class='secondTankImg' src='/src/view/Scene/img/fast.png'>
<img class='thirdTankImg' src='/src/view/Scene/img/power.png'>
<img class='fourthTankImg' src='/src/view/Scene/img/armor.png'>
</div>
</div>
<div class='killsTanksTotal'>
<p class='killsTanksTotalTittle'>Total</p>
<p class='killsTanksTotalScore'>0</p>
</div>
</div>
  `
  PTsEnemyTanks(enemiesKilledByScore)
}


function PTsEnemyTanks(enemiesKilledByScore: object) {
if(typeof enemiesKilledByScore == 'object'){
  let allScore = Object.values(enemiesKilledByScore)
let firstTank = document.querySelector('.PTsEnemyTanks1') as HTMLElement
let firstTankTotal = document.querySelector('.firstTank') as HTMLElement
let firstTankPTSCount = 0
let firstTankTanksCount = 0
let fitstInterval = setInterval(()=>{
  if(firstTankTanksCount >= allScore[0]){
clearInterval(fitstInterval)

let secondTank = document.querySelector('.PTsEnemyTanks2') as HTMLElement
let secondTankTotal = document.querySelector('.secondTank') as HTMLElement
let secondTankPTSCount = 0
let secondTankTanksCount = 0
let secondInterval = setInterval(()=>{
  if(secondTankTanksCount >= allScore[1]){
clearInterval(secondInterval)


let thirdTank = document.querySelector('.PTsEnemyTanks3') as HTMLElement
let thirdTankTotal = document.querySelector('.thirdTank') as HTMLElement
let thirdTankPTSCount = 0
let thirdTankTanksCount = 0
let thirdInterval = setInterval(()=>{
  if(thirdTankTanksCount >= allScore[2]){
clearInterval(thirdInterval)



let fourthTank = document.querySelector('.PTsEnemyTanks4') as HTMLElement
let fourthTankTotal = document.querySelector('.fourthTank') as HTMLElement
let fourthTankPTSCount = 0
let fourthTankTanksCount = 0
let fourthInterval = setInterval(()=>{
if(fourthTankTanksCount >= allScore[3]){
clearInterval(fourthInterval)

let total = document.querySelector('.killsTanksTotalScore') as HTMLElement
total.innerHTML = `${allScore.reduce((acc,el) => acc+el, 0)}`
}
else{
  fourthTankPTSCount +=400
  fourthTankTanksCount = fourthTankTanksCount+ 1
  fourthTank.innerText = `${fourthTankPTSCount} PTS`
  fourthTankTotal.innerHTML = `${fourthTankTanksCount}`
}
},400)



}
else{
thirdTankPTSCount +=300
  thirdTankTanksCount++
  thirdTank.innerText = `${thirdTankPTSCount} PTS`
  thirdTankTotal.innerHTML = `${thirdTankTanksCount}`
}

},400)



} else{
secondTankPTSCount +=200
  ++secondTankTanksCount
  secondTank.innerText = `${secondTankPTSCount} PTS`
  secondTankTotal.innerHTML = `${secondTankTanksCount}`
}
},400)



} else{
  firstTankPTSCount +=100
  firstTankTanksCount = firstTankTanksCount + 1
  firstTank.innerText = `${firstTankPTSCount} PTS`
  firstTankTotal.innerHTML = `${firstTankTanksCount}`
}
},400)
}
}


