import { TKeymap, ActorType } from '../typedefs';
import { constructCoord } from '../coord';
import { TLevel } from '../level';

import { TPlayer, createPlayer, updatePlayer } from './player';
import { TLava, createLava, updateLava } from './lava';
import { TCoin, createCoin, updateCoin } from './coin';

// ------------------------------------------------------------
export { ActorType, TPlayer, TLava, TCoin }
export type TActor = TPlayer | TLava | TCoin;
export type TLevelCharActor = '@' | 'o' | '=' | '|' | 'v';

// ------------------------------------------------------------
export function updateActor(actor: TActor, time: number, level: TLevel, keymap: TKeymap): TActor {
  // console.log('updateActor =>', { actor, time, level, keymap });
  switch (actor.type) {
    case ActorType.player:
      return updatePlayer(actor, time, level, keymap);
    case ActorType.lava:
      return updateLava(actor, time, level);
    case ActorType.coin:
      return updateCoin(actor, time);
  }
}

export function createActor(ch: TLevelCharActor, iCol: number, iRow: number): TActor {
  console.log('createActor =>', { ch, iCol, iRow });
  const pos = constructCoord(iCol, iRow);

  switch (ch) {
    case '@':
      return createPlayer(pos);
    case 'o':
      return createCoin(pos);
    default:
      return createLava(pos, ch);
  }
}
