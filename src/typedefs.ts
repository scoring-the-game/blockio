export const enum Key {
  arrowLeft = 'ArrowLeft',
  arrowRight = 'ArrowRight',
  arrowUp = 'ArrowUp',
}

export type TKeymap = { [key in Key]: boolean };

export enum ActorType {
  player = 'player',
  coin = 'coin',
  lava = 'lava',
}
