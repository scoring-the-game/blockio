// ------------------------------------------------------------
type TVec = {
  readonly x: number;
  readonly y: number;
};

function constructVec(x: number, y: number): TVec {
  return { x, y };
}

function vecPlus(v1: TVec, v2: TVec): TVec {
  return constructVec(v1.x + v2.x, v1.y + v2.y);
}

function vecScale(v: TVec, factor: number): TVec {
  return constructVec(v.x * factor, v.y * factor);
}

// ------------------------------------------------------------
const enum ActorType {
  lava = 'lava',
  coin = 'coin',
  player = 'player',
}

type TActorCore = {
  readonly type: ActorType;
  readonly pos: TVec;
  readonly size: TVec;
};

// ------------------------------------------------------------
type TPlayer = TActorCore & {
  readonly type: ActorType.player;
  readonly speed: TVec;
};

const playerSize = constructVec(0.8, 1.5);
const playerInitialOffset = constructVec(0, -0.5);
const playerInitialSpeed = constructVec(0, 0);

function constructPlayer(pos: TVec, speed: TVec): TPlayer {
  return { type: ActorType.player, pos, size: playerSize, speed };
}

function createPlayer(pos: TVec): TPlayer {
  return constructPlayer(vecPlus(pos, playerInitialOffset), playerInitialSpeed);
}

// ------------------------------------------------------------
type TLava = TActorCore & {
  readonly type: ActorType.lava;
  readonly speed: TVec;
  readonly reset: TVec; // ?
};

const sizeLava = constructVec(1, 1);

function constructLava(pos: TVec, speed: TVec, reset?: TVec): TLava {
  return { type: ActorType.lava, pos, size: sizeLava, speed, reset };
}

function createLava(pos: TVec, ch: '=' | '|' | 'v'): TLava {
  if (ch == '=') {
    return constructLava(pos, constructVec(2, 0));
  } else if (ch == '|') {
    return constructLava(pos, constructVec(0, 2));
  } else if (ch == 'v') {
    return constructLava(pos, constructVec(0, 3), pos);
  }
}

// ------------------------------------------------------------
type TCoin = TActorCore & {
  readonly type: ActorType.coin;
  readonly basePos: TVec;
  readonly wobble: number;
};

const sizeCoin = constructVec(0.6, 0.6);

function constructCoin(pos: TVec, basePos: TVec, wobble: number): TCoin {
  return { type: ActorType.coin, pos, size: sizeCoin, basePos, wobble };
}

function createCoin(pos: TVec): TCoin {
  const basePos = vecPlus(pos, constructVec(0.2, 0.1));
  const wobble = Math.random() * Math.PI * 2;
  return constructCoin(basePos, basePos, wobble);
}

// ------------------------------------------------------------
type TActor = TPlayer | TLava | TCoin;

// ------------------------------------------------------------
type TLevelCharCell = '.' | '#' | '+';
type TLevelCharActor = '@' | 'o' | '=' | '|' | 'v';
type TLevelChar = TLevelCharCell | TLevelCharActor;

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

const enum Cell {
  empty = 'empty',
  wall = 'wall',
  lava = 'lava',
}
type TRow = Cell[];
type TRows = TRow[];

const mapCellFromPlanType = {
  empty: Cell.empty,
  wall: Cell.wall,
  lava: Cell.lava,
};

type TLevel = {
  readonly height: number;
  readonly width: number;
  readonly rows: TRows;
  readonly initialActors: TActor[];
};

function createActor(ch: TLevelCharActor, x: number, y: number): TActor {
  const pos = constructVec(x, y);

  switch (ch) {
    case '@':
      return createPlayer(pos);
    case 'o':
      return createCoin(pos);
    default:
      return createLava(pos, ch);
  }
}

function constructLevel(plan: string): TLevel {
  let rowDefns = plan
    .trim()
    .split('\n')
    .map(l => [...l]);

  const height = rowDefns.length;
  const width = rowDefns[0].length;
  const rows = rowDefns.map((rowDefn: string[], y: number) => {
    return rowDefn.map(
      (ch: TLevelChar, x: number): Cell => {
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
      }
    );
  });
  const initialActors: TActor[] = rowDefns
    .map((rowDefn: string[], y: number) => {
      return rowDefn
        .map((ch: TLevelChar, x: number): TActor | null => {
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
              return createActor(ch, x, y);
          }
        })
        .filter(x => x !== null);
    })
    .flat();

  return { height, width, rows, initialActors };
}

// ------------------------------------------------------------
const enum Status {
  playing = 'playing',
  lost = 'lost',
  won = 'won',
}

type TState = {
  readonly level: TLevel;
  readonly actors: TActor[];
  readonly status: Status;
};

function constructState(level: TLevel, actors: TActor[], status: Status): TState {
  return { level, actors, status };
}

function StateStart(level: TLevel): TState {
  return constructState(level, level.initialActors, Status.playing);
}

function getPlayer(state: TState): TPlayer {
  return state.actors.find(a => a.type == ActorType.player) as TPlayer;
}

// ------------------------------------------------------------
const simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

const simpleLevel = constructLevel(simpleLevelPlan);

// ------------------------------------------------------------
function elt(name, attrs, ...children) {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

type TDisplay = {
  readonly dom: any;
  actorLayer: any;
};

function constructDisplay(parent, level: TLevel): TDisplay {
  const dom = elt('div', { class: 'game' }, drawGrid(level));
  const actorLayer = null;
  parent.appendChild(dom);
  return { dom, actorLayer };
}

function DisplayClear(display: TDisplay) {
  display.dom.remove();
}

const scale = 20;

function drawGrid(level) {
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

function drawActors(actors) {
  return elt(
    'div',
    {},
    ...actors.map(actor => {
      let rect = elt('div', { class: `actor ${actor.type}` });
      rect.style.width = `${actor.size.x * scale}px`;
      rect.style.height = `${actor.size.y * scale}px`;
      rect.style.left = `${actor.pos.x * scale}px`;
      rect.style.top = `${actor.pos.y * scale}px`;
      return rect;
    })
  );
}

function DisplaySyncState(display: TDisplay, state: TState) {
  if (display.actorLayer) display.actorLayer.remove();
  display.actorLayer = drawActors(state.actors);
  display.dom.appendChild(display.actorLayer);
  display.dom.className = `game ${state.status}`;
  DisplayScrollPlayerIntoView(display, state);
}

function DisplayScrollPlayerIntoView(display: TDisplay, state: TState) {
  let width = display.dom.clientWidth;
  let height = display.dom.clientHeight;
  let margin = width / 3;

  // The viewport
  let left = display.dom.scrollLeft,
    right = left + width;
  let top = display.dom.scrollTop,
    bottom = top + height;

  let player = getPlayer(state);
  let center = vecScale(vecPlus(player.pos, vecScale(player.size, 0.5)), scale);

  if (center.x < left + margin) {
    display.dom.scrollLeft = center.x - margin;
  } else if (center.x > right - margin) {
    display.dom.scrollLeft = center.x + margin - width;
  }
  if (center.y < top + margin) {
    display.dom.scrollTop = center.y - margin;
  } else if (center.y > bottom - margin) {
    display.dom.scrollTop = center.y + margin - height;
  }
}

function LevelTouches(level: TLevel, pos: TVec, size: TVec, type) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      let isOutside = x < 0 || x >= level.width || y < 0 || y >= level.height;
      let here = isOutside ? 'wall' : level.rows[y][x];
      if (here == type) return true;
    }
  }
  return false;
}

function updateActor(actor: TActor, time: number, state: TState, keys): TActor {
  switch (actor.type) {
    case ActorType.player:
      return PlayerUpdate(actor, time, state, keys);
    case ActorType.lava:
      return LavaUpdate(actor, time, state);
    case ActorType.coin:
      return CoinUpdate(actor, time);
  }
}

function collideActor(actor: TActor, state: TState): TState {
  switch (actor.type) {
    case ActorType.player:
      return state;
    case ActorType.lava:
      return LavaCollide(actor, state);
    case ActorType.coin:
      return CoinCollide(actor, state);
  }
}

function StateUpdate(state: TState, time, keys): TState {
  let actors = state.actors.map(actor => updateActor(actor, time, state, keys));
  let newState = constructState(state.level, actors, state.status);

  if (newState.status !== Status.playing) return newState;

  let player = getPlayer(newState);
  if (LevelTouches(state.level, player.pos, player.size, 'lava')) {
    return constructState(state.level, actors, Status.lost);
  }

  for (const actor of actors) {
    if (actor !== player && overlap(actor, player)) {
      newState = collideActor(actor, newState);
    }
  }

  return newState;
}

function overlap(actor1, actor2) {
  return (
    actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y
  );
}

function LavaCollide(lava: TLava, state: TState): TState {
  return constructState(state.level, state.actors, Status.lost);
}

function CoinCollide(coin: TCoin, state: TState): TState {
  let filtered = state.actors.filter(a => a != this);
  let status = state.status;
  if (!filtered.some(a => a.type == 'coin')) status = Status.won;
  return constructState(state.level, filtered, status);
}

function LavaUpdate(lava: TLava, time, state: TState): TLava {
  let newPos = vecPlus(lava.pos, vecScale(lava.speed, time));
  if (!LevelTouches(state.level, newPos, lava.size, 'wall')) {
    return constructLava(newPos, lava.speed, lava.reset);
  } else if (lava.reset) {
    return constructLava(lava.reset, lava.speed, lava.reset);
  } else {
    return constructLava(lava.pos, vecScale(lava.speed, -1));
  }
}

const wobbleSpeed = 8;
const wobbleDist = 0.07;

function CoinUpdate(coin: TCoin, time): TCoin {
  let wobble = coin.wobble + time * wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return constructCoin(vecPlus(coin.basePos, constructVec(0, wobblePos)), coin.basePos, wobble);
}

const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;

function PlayerUpdate(player: TPlayer, time, state: TState, keys): TPlayer {
  let xSpeed = 0;
  if (keys.ArrowLeft) xSpeed -= playerXSpeed;
  if (keys.ArrowRight) xSpeed += playerXSpeed;

  let pos = player.pos;
  let movedX = vecPlus(pos, constructVec(xSpeed * time, 0));
  if (!LevelTouches(state.level, movedX, player.size, 'wall')) {
    pos = movedX;
  }

  let ySpeed = player.speed.y + time * gravity;
  let movedY = vecPlus(pos, constructVec(0, ySpeed * time));
  if (!LevelTouches(state.level, movedY, player.size, 'wall')) {
    pos = movedY;
  } else if (keys.ArrowUp && ySpeed > 0) {
    ySpeed = -jumpSpeed;
  } else {
    ySpeed = 0;
  }

  return constructPlayer(pos, constructVec(xSpeed, ySpeed));
}

function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
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

function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runLevel(level): Promise<Status> {
  let display = constructDisplay(document.body, level);
  let state = StateStart(level);
  let ending = 1;
  return new Promise(resolve => {
    runAnimation(time => {
      state = StateUpdate(state, time, arrowKeys);
      DisplaySyncState(display, state);
      if (state.status == 'playing') {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        DisplayClear(display);
        resolve(state.status);
        return false;
      }
    });
  });
}

async function runGame(plans) {
  for (let level = 0; level < plans.length; ) {
    let status = await runLevel(constructLevel(plans[level]));
    if (status == 'won') level++;
  }
  console.log("You've won!");
}

import { levelDefns } from '../data/levels';
runGame(levelDefns);
