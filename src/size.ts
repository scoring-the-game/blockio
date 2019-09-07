export type TSize = {
  readonly dx: number;
  readonly dy: number;
};

export function constructSize(dx: number, dy: number): TSize {
  return { dx, dy };
}

export function sizeScale({ dx, dy }: TSize, factor: number): TSize {
  return constructSize(dx * factor, dy * factor);
}
