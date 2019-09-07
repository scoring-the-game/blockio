import { ActorType } from '../typedefs';
import { TCoord } from '../coord';
import { TSize } from '../size';

export type TActorCore = {
  readonly type: ActorType;
  readonly pos: TCoord;
  readonly size: TSize;
};
