type TKeys = any;

// ------------------------------------------------------------
const flatten = (xs: any[][]): any[] => xs.reduce((xs, x) => [...xs, ...x], []);

// ------------------------------------------------------------
type TPosition = {
  readonly x: number;
  readonly y: number;
};

function constructPosition(x: number, y: number): TPosition {
  return { x, y };
}

function positionAdd({ x, y }: TPosition, { dx, dy }: TSize): TPosition {
  return constructPosition(x + dx, y + dy);
}

function positionScale(v: TPosition, factor: number): TPosition {
  return constructPosition(v.x * factor, v.y * factor);
}

type TSize = {
  readonly dx: number;
  readonly dy: number;
};

function constructSize(dx: number, dy: number): TSize {
  return { dx, dy };
}

function sizeScale({ dx, dy }: TSize, factor: number): TSize {
  return constructSize(dx * factor, dy * factor);
}

// ------------------------------------------------------------
type TLevelCharCell = '.' | '#' | '+';
type TLevelCharActor = '@' | 'o' | '=' | '|' | 'v';
type TLevelChar = TLevelCharCell | TLevelCharActor;

const enum Cell {
  empty = 'empty',
  wall = 'wall',
  lava = 'lava',
}

type TRow = Cell[];
type TRows = TRow[];

type TRowDefn = TLevelChar[];
type TRowsDefn = TRowDefn[];

/*
const mapCellFromLevelChar = {
  '.': 'empty',
  '#': 'wall',
  '+': 'lava',
  '@': createPlayer,
  o: createCoin,
  '=': createLava,
  '|': createLava,
  v: createLava,
};

const mapCellFromPlanType = {
  empty: Cell.empty,
  wall: Cell.wall,
  lava: Cell.lava,
};
*/

type TLevel = {
  readonly width: number;
  readonly height: number;
  readonly rows: TRows;
  readonly initialActors: TActor[];
};

/*
class Level {
  readonly height: number;
  readonly width: number;
  readonly rows: TRows;
  readonly initialActors: TActor[];

  constructor(plan: string) {
    console.log('Level#ctor =>', { plan });
    const rowsDefn: TRowsDefn = plan
      .trim()
      .split('\n')
      .map(l => l.trim().split('')) as TLevelChar[][];

    this.height = rowsDefn.length;
    this.width = rowsDefn[0].length;

    this.rows = rowsDefn.map((rowDefn: TRowDefn, y: number) =>
      rowDefn.map((ch: TLevelChar, x: number) => {
        switch (ch) {
          case '.':
            return Cell.empty;
          case '#':
            return Cell.wall;
          case '+':
            return Cell.lava;
          case '@':
          case 'o':
          case '=':
          case '|':
          case 'v':
            return Cell.empty;
        }
      })
    );
    console.log('Level#ctor/rows =>', this.rows);

    this.initialActors = flatten(
      rowsDefn.map((rowDefn: TRowDefn, iRow: number) =>
        rowDefn
          .map((ch: TLevelChar, iCol: number) => calcActorFromLevelChar(ch, iCol, iRow))
          .filter(x => x !== null)
      )
    );
    console.log('Level#ctor/initialActors =>', this.initialActors);
  }

  touches(pos: TPosition, size: TSize, type: string): boolean {
    console.log('Level#touches =>', this, { pos, size, type });
    const xStart = Math.floor(pos.x);
    const xEnd = Math.ceil(pos.x + size.dx);
    const yStart = Math.floor(pos.y);
    const yEnd = Math.ceil(pos.y + size.dy);

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let isOutside = x < 0 || x >= this.width || y < 0 || y >= this.height;
        let here = isOutside ? 'wall' : this.rows[y][x];
        if (here == type) return true;
      }
    }
    return false;
  }
}
*/

function createActor(ch: TLevelCharActor, iCol: number, iRow: number): TActor {
  console.log('createActor =>', { ch, iCol, iRow });
  const pos = constructPosition(iCol, iRow);

  switch (ch) {
    case '@':
      return createPlayer(pos);
    case 'o':
      return createCoin(pos);
    default:
      return createLava(pos, ch);
  }
}

function calcActorFromLevelChar(ch: TLevelChar, iCol: number, iRow: number): TActor | null {
  switch (ch) {
    case '.':
    case '#':
    case '+':
      return null;

    case '@':
    case 'o':
    case '=':
    case '|':
    case 'v':
      return createActor(ch, iCol, iRow);
  }
}

function constructLevel(plan: string): TLevel {
  console.log('constructLevel =>', { plan });
  const rowsDefn: TRowsDefn = plan
    .trim()
    .split('\n')
    .map(l => l.trim().split('')) as TLevelChar[][];

  const width = rowsDefn[0].length;
  const height = rowsDefn.length;

  const rows = rowsDefn.map((rowDefn: TRowDefn, y: number) =>
    rowDefn.map((ch: TLevelChar, x: number) => {
      switch (ch) {
        case '.':
          return Cell.empty;
        case '#':
          return Cell.wall;
        case '+':
          return Cell.lava;
        case '@':
        case 'o':
        case '=':
        case '|':
        case 'v':
          return Cell.empty;
      }
    })
  );
  console.log('constructLevel/rows =>', rows);

  const initialActors = flatten(
    rowsDefn.map((rowDefn: TRowDefn, iRow: number) =>
      rowDefn
        .map((ch: TLevelChar, iCol: number) => calcActorFromLevelChar(ch, iCol, iRow))
        .filter(x => x !== null)
    )
  );
  console.log('constructLevel/initialActors =>', initialActors);

  return { width, height, rows, initialActors };
}

function touches(level: TLevel, pos: TPosition, size: TSize, type: string): boolean {
  console.log('Level#touches =>', level, { pos, size, type });
  const xStart = Math.floor(pos.x);
  const xEnd = Math.ceil(pos.x + size.dx);
  const yStart = Math.floor(pos.y);
  const yEnd = Math.ceil(pos.y + size.dy);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let isOutside = x < 0 || x >= level.width || y < 0 || y >= level.height;
      let here = isOutside ? 'wall' : level.rows[y][x];
      if (here == type) return true;
    }
  }
  return false;
}

// ------------------------------------------------------------
const enum Status {
  playing = 'playing',
  lost = 'lost',
  won = 'won',
}

// ------------------------------------------------------------
function updateActor(actor: TActor, time: number, state: TState, keys: TKeys): TActor {
  console.log('updateActor =>', { actor, time, state, keys });
  switch (actor.type) {
    case ActorType.player:
      return updatePlayer(actor, time, state, keys);
    case ActorType.lava:
      return updateLava(actor, time, state);
    case ActorType.coin:
      return updateCoin(actor, time);
  }
}

function collideActor(actor: TLava | TCoin, state: TState): TState {
  switch (actor.type) {
    case ActorType.lava:
      return collideLava(actor, state);
    case ActorType.coin:
      return collideCoin(actor, state);
  }
}

/*
class State {
  readonly level: TLevel;
  readonly actors: TActor[];
  readonly status: Status;

  static start(level: TLevel): State {
    console.log('State::start =>', { level });
    return new State(level, level.initialActors, Status.playing);
  }

  constructor(level: TLevel, actors: TActor[], status: Status) {
    console.log('State#ctor =>', { level, actors, status });
    this.level = level;
    this.actors = actors;
    this.status = status;
  }

  get player(): TPlayer {
    return this.actors.find(a => a.type === ActorType.player) as TPlayer;
  }

  update(time: number, keys: TKeys): State {
    console.log('State#update =>', this, { time, keys });

    const actors = this.actors.map(actor => {
      console.log('State#update/1 =>', { actor, time });
      return updateActor(actor, time, this, keys);
    });

    let newState = constructState(this.level, actors, this.status);
    if (newState.status != Status.playing) return newState;

    const player: TPlayer = newState.player;
    if (touches(this.level, player!.pos, player.size, 'lava')) {
      return constructState(this.level, actors, Status.lost);
    }

    for (const actor of actors) {
      if (actor.type !== ActorType.player && doesActorOverlapPlayer(actor, player)) {
        newState = collideActor(actor, newState);
      }
    }
    return newState;
  }
}
*/

type TState = {
  readonly status: Status;
  readonly level: TLevel;
  readonly actors: TActor[];
};

function startGame(level: TLevel): TState {
  console.log('State::start =>', { level });
  return constructState(level, level.initialActors, Status.playing);
}

function constructState(level: TLevel, actors: TActor[], status: Status): TState {
  console.log('State#ctor =>', { level, actors, status });
  return { level, actors, status };
}

function getPlayer(state: TState): TPlayer {
  return state.actors.find(a => a.type === ActorType.player) as TPlayer;
}

function updateState(state: TState, time: number, keys: TKeys): TState {
  console.log('State#update =>', state, { time, keys });

  const actors = state.actors.map(actor => {
    console.log('State#update/1 =>', { actor, time });
    return updateActor(actor, time, state, keys);
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
  console.log('doesActorOverlapPlayer/0 =>', actor.type);
  const actorRect = calcActorRect(actor);
  const playerRect = calcActorRect(player);
  console.log('doesActorOverlapPlayer/1 =>', actorRect, playerRect);

  const doesOverlap =
    actorRect.right > playerRect.left &&
    actorRect.left < playerRect.right &&
    actorRect.bottom > playerRect.top &&
    actorRect.top < playerRect.bottom;
  console.log('doesActorOverlapPlayer/doesOverlap =>', doesOverlap);
  return doesOverlap;
}

// ------------------------------------------------------------
const enum ActorType {
  player = 'player',
  coin = 'coin',
  lava = 'lava',
}

// type Actor = Coin | Lava | Player;

type TActorCore = {
  readonly type: ActorType;
  readonly pos: TPosition;
  readonly size: TSize;
};

type TActor = TPlayer | TLava | TCoin;

// ------------------------------------------------------------
const kPlayerXSpeed = 7;
const kGravity = 30;
const kJumpSpeed = 17;

const playerSize = constructSize(0.8, 1.5);
const playerInitialOffset = constructSize(0, -0.5);
const playerInitialSpeed = constructSize(0, 0);

/*
class Player {
  readonly size: TSize = playerSize;
  readonly pos: TPosition;
  readonly speed: TSize;

  // static create(pos: TPosition): Player {
  //   return new Player(positionAdd(pos, constructPosition(0, -0.5)), constructPosition(0, 0));
  // }

  constructor(pos: TPosition, speed: TSize) {
    this.pos = pos;
    this.speed = speed;
  }

  get type(): ActorType {
    return ActorType.player;
  }

  update(time: number, state: State, keys: TKeys): Player {
    console.log('Player#update =>', this, { time, state, keys });
    let xSpeed = 0;
    if (keys.ArrowLeft) xSpeed -= kPlayerXSpeed;
    if (keys.ArrowRight) xSpeed += kPlayerXSpeed;
    let pos = this.pos;
    let movedX = positionAdd(pos, constructSize(xSpeed * time, 0));
    if (!state.level.touches(movedX, this.size, 'wall')) {
      pos = movedX;
    }

    let ySpeed = this.speed.dy + time * kGravity;
    let movedY = positionAdd(pos, constructSize(0, ySpeed * time));
    if (!state.level.touches(movedY, this.size, 'wall')) {
      pos = movedY;
    } else if (keys.ArrowUp && ySpeed > 0) {
      ySpeed = -kJumpSpeed;
    } else {
      ySpeed = 0;
    }
    return new Player(pos, constructSize(xSpeed, ySpeed));
  }
}
// */

function createPlayer(pos: TPosition): TPlayer {
  console.log('createPlayer =>', { pos });
  // return new Player(positionAdd(pos, playerInitialOffset), playerInitialSpeed);
  return constructPlayer(positionAdd(pos, playerInitialOffset), playerInitialSpeed);
}

type TPlayer = TActorCore & {
  readonly type: ActorType.player;
  readonly speed: TSize;
};

function constructPlayer(pos: TPosition, speed: TSize): TPlayer {
  return { type: ActorType.player, pos, speed, size: playerSize };
}

function updatePlayer(player: TPlayer, time: number, state: TState, keys: TKeys): TPlayer {
  console.log('updatePlayer =>', player, { time, state, keys });
  let xSpeed = 0;
  if (keys.ArrowLeft) xSpeed -= kPlayerXSpeed;
  if (keys.ArrowRight) xSpeed += kPlayerXSpeed;
  let pos = player.pos;
  let movedX = positionAdd(pos, constructSize(xSpeed * time, 0));
  if (!touches(state.level, movedX, player.size, 'wall')) {
    pos = movedX;
  }

  let ySpeed = player.speed.dy + time * kGravity;
  let movedY = positionAdd(pos, constructSize(0, ySpeed * time));
  if (!touches(state.level, movedY, player.size, 'wall')) {
    pos = movedY;
  } else if (keys.ArrowUp && ySpeed > 0) {
    ySpeed = -kJumpSpeed;
  } else {
    ySpeed = 0;
  }
  return constructPlayer(pos, constructSize(xSpeed, ySpeed));
}

// ------------------------------------------------------------
type TLavaChar = '=' | '|' | 'v';

type TLava = TActorCore & {
  readonly type: ActorType.lava;
  readonly speed: TSize;
  readonly reset: TPosition | undefined;
};

const lavaSize = constructSize(1, 1);

// class Lava {
//   readonly size: TSize = lavaSize;
//   readonly pos: TPosition;
//   readonly speed: TSize;
//   readonly reset: TPosition | undefined;
//
//   // static create(pos: TPosition, ch: TLavaChar): Lava {
//   //   if (ch === '=') return new Lava(pos, constructPosition(2, 0));
//   //   if (ch === '|') return new Lava(pos, constructPosition(0, 2));
//   //   /* if (ch === 'v') */ return new Lava(pos, constructPosition(0, 3), pos);
//   // }
//
//   constructor(pos: TPosition, speed: TSize, reset?: TPosition) {
//     this.pos = pos;
//     this.speed = speed;
//     this.reset = reset;
//   }
//
//   get type(): ActorType {
//     return ActorType.lava;
//   }
//
//   collide(state: State): State {
//     console.log('Lava#collide =>', this, { state });
//     return constructState(state.level, state.actors, Status.lost);
//   }
//
//   update(time: number, state: State): Lava {
//     console.log('Lava#update =>', this, { time, state });
//     let newPos = positionAdd(this.pos, sizeScale(this.speed, time));
//     if (!state.level.touches(newPos, this.size, 'wall')) {
//       return new Lava(newPos, this.speed, this.reset);
//     } else if (this.reset) {
//       return new Lava(this.reset, this.speed, this.reset);
//     } else {
//       return new Lava(this.pos, sizeScale(this.speed, -1));
//     }
//   }
// }

function createLava(pos: TPosition, ch: TLavaChar): TLava {
  console.log('createLava =>', { pos, ch });
  if (ch === '=') return constructLava(pos, constructSize(2, 0));
  if (ch === '|') return constructLava(pos, constructSize(0, 2));
  /* if (ch === 'v') */ return constructLava(pos, constructSize(0, 3), pos);
}

function constructLava(pos: TPosition, speed: TSize, reset?: TPosition | undefined): TLava {
  return { type: ActorType.lava, pos, size: lavaSize, speed, reset };
}

function collideLava(lava: TLava, state: TState): TState {
  console.log('Lava#collide =>', lava, { state });
  return constructState(state.level, state.actors, Status.lost);
}

function updateLava(lava: TLava, time: number, state: TState): TLava {
  console.log('Lava#update =>', lava, { time, state });
  let newPos = positionAdd(lava.pos, sizeScale(lava.speed, time));
  if (!touches(state.level, newPos, lava.size, 'wall')) {
    return constructLava(newPos, lava.speed, lava.reset);
  } else if (lava.reset) {
    return constructLava(lava.reset, lava.speed, lava.reset);
  } else {
    return constructLava(lava.pos, sizeScale(lava.speed, -1));
  }
}

// ------------------------------------------------------------
const wobbleSpeed = 8;
const wobbleDist = 0.07;

const coinSize = constructSize(0.6, 0.6);

type TCoin = TActorCore & {
  readonly type: ActorType.coin;
  readonly basePos: TPosition;
  readonly wobble: number;
};

// class Coin {
//   readonly size: TSize = coinSize;
//   readonly pos: TPosition;
//   readonly basePos: TPosition;
//   readonly wobble: number;
//
//   // static create(pos: TPosition): Coin {
//   //   let basePos = positionAdd(pos, constructPosition(0.2, 0.1));
//   //   return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
//   // }
//
//   constructor(pos: TPosition, basePos: TPosition, wobble: number) {
//     this.pos = pos;
//     this.basePos = basePos;
//     this.wobble = wobble;
//   }
//
//   get type(): ActorType {
//     return ActorType.coin;
//   }
//
//   collide(state: State): State {
//     console.log('Coin#collide =>', this, { state });
//     let filtered = state.actors.filter(a => a != this);
//     let status = state.status;
//     if (!filtered.some(a => a.type == ActorType.coin)) status = Status.won;
//     return constructState(state.level, filtered, status);
//   }
//
//   update(time: number): Coin {
//     console.log('Coin#update =>', this, { time });
//     let wobble = this.wobble + time * wobbleSpeed;
//     let wobblePos = Math.sin(wobble) * wobbleDist;
//     return new Coin(positionAdd(this.basePos, constructSize(0, wobblePos)), this.basePos, wobble);
//   }
// }

function createCoin(pos: TPosition): TCoin {
  console.log('createCoin =>', { pos });
  const basePos = positionAdd(pos, constructSize(0.2, 0.1));
  return constructCoin(basePos, basePos, Math.random() * Math.PI * 2);
}

function constructCoin(pos: TPosition, basePos: TPosition, wobble: number): TCoin {
  return { type: ActorType.coin, pos, size: coinSize, basePos, wobble };
}

function collideCoin(coin: TCoin, state: TState): TState {
  console.log('Coin#collide =>', { coin, state });
  let filtered = state.actors.filter(a => a != coin);
  let status = state.status;
  if (!filtered.some(a => a.type == ActorType.coin)) status = Status.won;
  return constructState(state.level, filtered, status);
}

function updateCoin(coin: TCoin, time: number): TCoin {
  console.log('Coin#update =>', { coin, time });
  let wobble = coin.wobble + time * wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return constructCoin(
    positionAdd(coin.basePos, constructSize(0, wobblePos)),
    coin.basePos,
    wobble
  );
}

// ------------------------------------------------------------
interface IDisplay {
  clear(): void;
  syncState(state: TState): void;
  scrollPlayerIntoView(state: TState): void;
}

type TElement = any;

function elt(name: string, attrs: any, ...children: TElement[]): TElement {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

class DOMDisplay implements IDisplay {
  readonly dom: any;
  actorLayer: any;

  constructor(parent: any, level: TLevel) {
    this.dom = elt('div', { class: 'game' }, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }

  clear() {
    this.dom.remove();
  }

  syncState(state: TState): void {
    console.log('DOMDisplay#syncState =>', this, { state });
    if (this.actorLayer) this.actorLayer.remove();
    this.actorLayer = drawActors(state.actors);
    this.dom.appendChild(this.actorLayer);
    this.dom.className = `game ${state.status}`;
    this.scrollPlayerIntoView(state);
  }

  scrollPlayerIntoView(state: TState): void {
    console.log('DOMDisplay#scrollPlayerIntoView =>', this, { state });
    let width = this.dom.clientWidth;
    let height = this.dom.clientHeight;
    let margin = width / 3;

    // The viewport
    let left = this.dom.scrollLeft,
      right = left + width;
    let top = this.dom.scrollTop,
      bottom = top + height;

    let player = getPlayer(state);
    let center = positionScale(positionAdd(player.pos, sizeScale(player.size, 0.5)), scale);

    if (center.x < left + margin) {
      this.dom.scrollLeft = center.x - margin;
    } else if (center.x > right - margin) {
      this.dom.scrollLeft = center.x + margin - width;
    }
    if (center.y < top + margin) {
      this.dom.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
      this.dom.scrollTop = center.y + margin - height;
    }
  }
}

// ------------------------------------------------------------
const scale = 20;

function drawGrid(level: TLevel): TElement {
  console.log('drawGrid');
  return elt(
    'table',
    {
      class: 'background',
      style: `width: ${level.width * scale}px`,
    },
    ...level.rows.map(row =>
      elt('tr', { style: `height: ${scale}px` }, ...row.map(type => elt('td', { class: type })))
    )
  );
}

function drawActors(actors: TActor[]): TElement {
  console.log('drawActors =>', { actors });
  return elt(
    'div',
    {},
    ...actors.map(actor => {
      let rect = elt('div', { class: `actor ${actor.type}` });
      rect.style.width = `${actor.size.dx * scale}px`;
      rect.style.height = `${actor.size.dy * scale}px`;
      rect.style.left = `${actor.pos.x * scale}px`;
      rect.style.top = `${actor.pos.y * scale}px`;
      return rect;
    })
  );
}

function trackKeys(keys: TKeys) {
  let down = Object.create(null);

  function track(event: KeyboardEvent) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == 'keydown';
      event.preventDefault();
    }
  }

  window.addEventListener('keydown', track);
  window.addEventListener('keyup', track);
  return down;
}

const arrowKeys = trackKeys(['ArrowLeft', 'ArrowRight', 'ArrowUp']);

type TFnAnimationFrame = (millis: number) => boolean;

function runAnimation(frameFunc: TFnAnimationFrame): void {
  let millisPrev: number | null = null;

  function tick(millis: number) {
    if (millisPrev !== null) {
      let timeStep = Math.min(millis - millisPrev, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    millisPrev = millis;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function runLevel(level: TLevel, constructDisplay: (level: TLevel) => IDisplay): Promise<Status> {
  const display = constructDisplay(level);
  let state = startGame(level);
  let ending = 1;

  function update(resolve: Function, millis: number): boolean {
    state = updateState(state, millis, arrowKeys);
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

export function constructDOMDisplay(level: TLevel): IDisplay {
  return new DOMDisplay(document.body, level);
}

export async function runGame(
  plans: string[],
  constructDisplay: (level: TLevel) => IDisplay
): Promise<void> {
  console.log('runGame/0');
  for (let iLevel = 0; iLevel < plans.length; ) {
    console.log('runGame/1 =>', iLevel);
    const plan = plans[iLevel];
    console.log('runGame/2 =>', plan);
    const level = constructLevel(plan);
    console.log('runGame/3 =>', level);
    const status = await runLevel(level, constructDisplay);
    console.log('runGame/4 =>', status);
    if (status == Status.won) iLevel++;
  }
  console.log("You've won!");
}
