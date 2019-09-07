import { ActorType, Key, TKeymap } from '../typedefs';
import { TCoord } from '../coord';
import { TSize } from '../size';
import { TLevel } from '../level';
import { TActorCore } from './typedefs';

// ------------------------------------------------------------
import { coordAdd } from '../coord';
import { constructSize } from '../size';
import { touches } from '../level';

// ------------------------------------------------------------
export type TPlayer = TActorCore & {
  readonly type: ActorType.player;
  readonly speed: TSize;
};

// ------------------------------------------------------------
const kPlayerXSpeed = 7;
const kGravity = 30;
const kJumpSpeed = 17;

const sizePlayer = constructSize(0.8, 1.5);
const initialOffset = constructSize(0, -0.5);
const initialSpeed = constructSize(0, 0);

// ------------------------------------------------------------
function constructPlayer(pos: TCoord, speed: TSize): TPlayer {
  return { type: ActorType.player, pos, speed, size: sizePlayer };
}

export function createPlayer(pos: TCoord): TPlayer {
  console.log('createPlayer =>', { pos });
  // return new Player(coordAdd(pos, initialOffset), initialSpeed);
  return constructPlayer(coordAdd(pos, initialOffset), initialSpeed);
}

export function updatePlayer(player: TPlayer, time: number, level: TLevel, keymap: TKeymap): TPlayer {
  console.log('updatePlayer =>', player, { time, level, keymap });
  let xSpeed = 0;
  if (keymap[Key.arrowLeft]) xSpeed -= kPlayerXSpeed;
  if (keymap[Key.arrowRight]) xSpeed += kPlayerXSpeed;
  let pos = player.pos;
  let movedX = coordAdd(pos, constructSize(xSpeed * time, 0));
  if (!touches(level, movedX, player.size, 'wall')) {
    pos = movedX;
  }

  let ySpeed = player.speed.dy + time * kGravity;
  let movedY = coordAdd(pos, constructSize(0, ySpeed * time));
  if (!touches(level, movedY, player.size, 'wall')) {
    pos = movedY;
  } else if (keymap[Key.arrowUp] && ySpeed > 0) {
    ySpeed = -kJumpSpeed;
  } else {
    ySpeed = 0;
  }
  return pos === player.pos && xSpeed === 0 && ySpeed === 0
    ? player
    : constructPlayer(pos, constructSize(xSpeed, ySpeed));
}
