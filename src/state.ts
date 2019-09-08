import { TKeymap, ActorType } from './typedefs';
import { TLevel, touches } from './level';
import { TActor, TPlayer, TLava, TCoin, updateActor } from './actors';

// ------------------------------------------------------------
export const enum Status {
  playing = 'playing',
  lost = 'lost',
  won = 'won',
}

export type TState = {
  readonly status: Status;
  readonly level: TLevel;
  readonly actors: TActor[];
};

// ------------------------------------------------------------
export function createState(level: TLevel): TState {
  console.log('State::start =>', { level });
  return constructState(level, level.initialActors, Status.playing);
}

function constructState(level: TLevel, actors: TActor[], status: Status): TState {
  console.log('State#ctor =>', { level, actors, status });
  return { level, actors, status };
}

export function getPlayer(state: TState): TPlayer {
  return state.actors.find(a => a.type === ActorType.player) as TPlayer;
}

export function updateState(state: TState, time: number, keymap: TKeymap): TState {
  // console.log('State#update =>', state, { time, keymap });

  const actors = state.actors.map(actor => {
    return updateActor(actor, time, state.level, keymap);
  });

  let newState = constructState(state.level, actors, state.status);
  if (newState.status != Status.playing) return newState;

  const player: TPlayer = getPlayer(newState);
  if (touches(state.level, player!.pos, player.size, 'lava')) {
    return constructState(state.level, actors, Status.lost);
  }

  for (const actor of actors) {
    if (actor.type !== ActorType.player && doesActorOverlapPlayer(actor, player)) {
      newState = collideActor(actor, newState);
    }
  }
  return newState;
}

function collideCoin(coin: TCoin, state: TState): TState {
  console.log('Coin#collide =>', { coin, state });
  let filtered = state.actors.filter(a => a != coin);
  let status = state.status;
  if (!filtered.some(a => a.type == ActorType.coin)) status = Status.won;
  return constructState(state.level, filtered, status);
}

function collideLava(lava: TLava, state: TState): TState {
  console.log('Lava#collide =>', lava, { state });
  return constructState(state.level, state.actors, Status.lost);
}

function collideActor(actor: TLava | TCoin, state: TState): TState {
  switch (actor.type) {
    case ActorType.lava:
      return collideLava(actor, state);
    case ActorType.coin:
      return collideCoin(actor, state);
  }
}

type TRect = {
  readonly top: number;
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
};

function calcActorRect({ pos: { x, y }, size: { dx, dy } }: TActor): TRect {
  const top = y;
  const bottom = top + dy;
  const left = x;
  const right = left + dx;
  return { top, bottom, left, right };
}

function doesActorOverlapPlayer(actor: TActor, player: TPlayer): boolean {
  // console.log('doesActorOverlapPlayer/0 =>', actor.type);
  const actorRect = calcActorRect(actor);
  const playerRect = calcActorRect(player);
  // console.log('doesActorOverlapPlayer/1 =>', actorRect, playerRect);

  const doesOverlap =
    actorRect.right > playerRect.left &&
    actorRect.left < playerRect.right &&
    actorRect.bottom > playerRect.top &&
    actorRect.top < playerRect.bottom;
  // console.log('doesActorOverlapPlayer/doesOverlap =>', doesOverlap);
  return doesOverlap;
}
