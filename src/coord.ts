import { TSize } from './size';

export type TCoord = {
  readonly x: number;
  readonly y: number;
};

export function constructCoord(x: number, y: number): TCoord {
  return { x, y };
}

export function coordAdd({ x, y }: TCoord, { dx, dy }: TSize): TCoord {
  return constructCoord(x + dx, y + dy);
}

export function coordScale(v: TCoord, factor: number): TCoord {
  return constructCoord(v.x * factor, v.y * factor);
}
