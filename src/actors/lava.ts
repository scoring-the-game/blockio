import { ActorType } from '../typedefs';
import { TCoord } from '../coord';
import { TSize } from '../size';
import { TLevel } from '../level';
import { TActorCore } from './typedefs';

// ------------------------------------------------------------
import { coordAdd } from '../coord';
import { constructSize, sizeScale } from '../size';
import { touches } from '../level';

// ------------------------------------------------------------
type TLavaChar = '=' | '|' | 'v';

export type TLava = TActorCore & {
  readonly type: ActorType.lava;
  readonly speed: TSize;
  readonly reset: TCoord | undefined;
};

// ------------------------------------------------------------
const sizeLava = constructSize(1, 1);

// ------------------------------------------------------------
function constructLava(pos: TCoord, speed: TSize, reset?: TCoord | undefined): TLava {
  return { type: ActorType.lava, pos, size: sizeLava, speed, reset };
}

export function createLava(pos: TCoord, ch: TLavaChar): TLava {
  console.log('createLava =>', { pos, ch });
  if (ch === '=') return constructLava(pos, constructSize(2, 0));
  if (ch === '|') return constructLava(pos, constructSize(0, 2));
  /* if (ch === 'v') */ return constructLava(pos, constructSize(0, 3), pos);
}

export function updateLava(lava: TLava, time: number, level: TLevel): TLava {
  // console.log('Lava#update =>', lava, { time, level });
  let newPos = coordAdd(lava.pos, sizeScale(lava.speed, time));
  if (!touches(level, newPos, lava.size, 'wall')) {
    return constructLava(newPos, lava.speed, lava.reset);
  } else if (lava.reset) {
    return constructLava(lava.reset, lava.speed, lava.reset);
  } else {
    return constructLava(lava.pos, sizeScale(lava.speed, -1));
  }
}

