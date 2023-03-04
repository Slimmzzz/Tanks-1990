// @ts-ignore
import './lvlScore.scss'

/**
 * Renders 'results' view and triggers step-by-step score count.
 * @param hiScore Current high-score of the game
 * @param stage Current stage (or last stage before game over)
 * @param scoreLevel Score gained at last played level
 * @param enemiesKilledByScore Object with kills count grouped by enemy types
 * @returns Promise that resolves 3s after all scores were counted. `location.reload()` happens straight after resolving.
 */
export function lvlScore(hiScore: number = 0, stage:number, scoreLevel: number, enemiesKilledByScore: object): Promise<void> {
  return new Promise((res) => {
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
        <p class='Tank1'>0</p>
        <p class='Tank2'>0</p>
        <p class='Tank3'>0</p>
        <p class='Tank4'>0</p>
        </div>
        <div class='PTSArrow'>
        <p class='PTSArrow1'><-</p>
        <p class='PTSArrow2'><-</p>
        <p class='PTSArrow3'><-</p>
        <p class='PTSArrow4'><-</p>
        </div>
        <div class='enemyTank'>
        <img class='firstTankImg' src='/public/img/basic.png'>
        <img class='secondTankImg' src='/public/img/fast.png'>
        <img class='thirdTankImg' src='/public/img/power.png'>
        <img class='fourthTankImg' src='/public/img/armor.png'>
        </div>
        </div>
        <div class='killsTanksTotal'>
        <p class='killsTanksTotalTittle'>Total</p>
        <p class='killsTanksTotalScore'>0</p>
        </div>
        </div>
      `;
    RenderPoints(enemiesKilledByScore).then(() => {
      setTimeout(() => {
        res();
      }, 3000);
    });
  });
}

/**
 * One tick of score increment.
 * Triggers per every kill and updates killed tanks count by 1.
 * @param prev Previous-step kills count
 * @param score Enemy's kill score
 * @returns Promise that resolves when the scores are incremented (with 0.3s timeout)
 */
function singlePointCounter(prev: number, score: number) : Promise<void> {
  return new Promise((res) => {
    setTimeout(() => {
      const actual = prev + 1;
      (document.querySelector(`.Tank${score / 100}`) as HTMLElement).innerHTML = `${(actual)}`;
      (document.querySelector(`.PTsEnemyTanks${score / 100}`) as HTMLElement).innerHTML = `${actual * score} PTS`;
      res();
    }, 300);
  });
}

/**
 * One row's (one enemy type) kill-scores count.
 * @param killedTanks Count of killed tanks per one type
 * @param score Kill score of enemy type
 * @returns Promise that resolves 0.5s after all kills of a certain enemy types are count
 */
function singleTankCounter(killedTanks: number, score: number) : Promise<void> {
  return new Promise(async (res) => {
    for (let i = 0; i < killedTanks; i++) {
      await singlePointCounter(i, score);
      const total = document.querySelector('.killsTanksTotalScore') as HTMLElement;
      total.innerHTML = `${Number(total.innerHTML) + score}`;
    }

    setTimeout(() => {
      res();
    }, 500);
  });
}

/**
 * Main method of step-by-step kills counting.
 * @param enemiesKilledByScore Object with kills count grouped by enemy types
 * @returns Promise that resolves when all kills of all enemy types are counted
 */
async function RenderPoints(enemiesKilledByScore: object): Promise<void> {
  const entries = Object.entries(enemiesKilledByScore);
  for (let i = 0; i < entries.length; i++) {
    const [ score, killedTanks ] = entries[i];
    await singleTankCounter(killedTanks, +score);
  }

  return Promise.resolve();
}
