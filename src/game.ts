import { TKeymap } from './typedefs';
import { TLevel, constructLevel } from './level';
import { Status, createState, updateState } from './state';
import { constructDisplay } from './display';
import { startKeyboardListener } from './keymap';

type TFnAnimationFrame = (dt: number) => boolean;

function runAnimation(frameFunc: TFnAnimationFrame): void {
  let millisPrev: number | null = null;

  function tick(millis: number) {
    if (millisPrev !== null) {
      const dt = Math.min(millis - millisPrev, 100) / 1000;
      const result = frameFunc(dt);
      if (result === false) return;
    }
    millisPrev = millis;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function runLevel(level: TLevel, getKeymap: () => TKeymap): Promise<Status> {
  const display = constructDisplay(level);
  let state = createState(level);
  let ending = 1;

  function update(resolve: Function, millis: number): boolean {
    state = updateState(state, millis, getKeymap());
    display.syncState(state);

    if (state.status == Status.playing) return true;

    if (ending > 0) {
      ending -= millis;
      return true;
    }

    display.clear();
    resolve(state.status);
    return false;
  }

  return new Promise(resolve => runAnimation(millis => update(resolve, millis)));
}

export async function runGame(plans: string[]): Promise<void> {
  const getKeymap = startKeyboardListener();
  for (let iLevel = 0; iLevel < plans.length; ) {
    const plan = plans[iLevel];
    const level = constructLevel(plan);
    const status = await runLevel(level, getKeymap);
    if (status == Status.won) iLevel++;
  }
  console.log("You've won!");
}
