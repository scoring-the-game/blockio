import { TCoord } from './coord';
import { TSize } from './size';
import { TActor, TLevelCharActor, createActor } from './actors';

// ------------------------------------------------------------
type TLevelCharCell = '.' | '#' | '+';
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

export type TLevel = {
  readonly width: number;
  readonly height: number;
  readonly rows: TRows;
  readonly initialActors: TActor[];
};

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

export function constructLevel(plan: string): TLevel {
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

  const calcActorsFromRowDefn = (rowDefn: TRowDefn, iRow: number): TActor[] =>
    rowDefn
      .map((ch: TLevelChar, iCol: number) => calcActorFromLevelChar(ch, iCol, iRow))
      .filter(x => x !== null) as TActor[];

  const initialActors = rowsDefn.map(calcActorsFromRowDefn).flat();
  console.log('constructLevel/initialActors =>', initialActors);

  return { width, height, rows, initialActors };
}

export function touches(level: TLevel, pos: TCoord, size: TSize, type: string): boolean {
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
