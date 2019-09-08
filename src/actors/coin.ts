import { ActorType } from '../typedefs';
import { TCoord } from '../coord';
import { TActorCore } from './typedefs';

// ------------------------------------------------------------
import { coordAdd } from '../coord';
import { constructSize } from '../size';

// ------------------------------------------------------------
export type TCoin = TActorCore & {
  readonly type: ActorType.coin;
  readonly basePos: TCoord;
  readonly wobble: number;
};

// ------------------------------------------------------------
const wobbleSpeed = 8;
const wobbleDist = 0.07;

const sizeCoin = constructSize(0.6, 0.6);

// ------------------------------------------------------------
function constructCoin(pos: TCoord, basePos: TCoord, wobble: number): TCoin {
  return { type: ActorType.coin, pos, size: sizeCoin, basePos, wobble };
}

export function createCoin(pos: TCoord): TCoin {
  console.log('createCoin =>', { pos });
  const basePos = coordAdd(pos, constructSize(0.2, 0.1));
  return constructCoin(basePos, basePos, Math.random() * Math.PI * 2);
}

export function updateCoin(coin: TCoin, time: number): TCoin {
  // console.log('Coin#update =>', { coin, time });
  let wobble = coin.wobble + time * wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return constructCoin(coordAdd(coin.basePos, constructSize(0, wobblePos)), coin.basePos, wobble);
}
