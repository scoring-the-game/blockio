import { coordAdd, coordScale } from './coord';
import { sizeScale } from './size';
import { TLevel, Cell, TRow } from './level';
import { TActor } from './actors';
import { TState, getPlayer } from './state';

// ------------------------------------------------------------
type TElement = HTMLElement;

export type TDisplay = {
  readonly dom: TElement;
  actorLayer: TElement | null;
};

// ------------------------------------------------------------
const scale = 20;

// ------------------------------------------------------------
function renderElement(name: string, attrs: any, ...children: TElement[]): TElement {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

// ------------------------------------------------------------
const calcCellAttrs = (type: Cell) => ({ class: type });

const calcRowAttrs = () => ({ style: `height: ${scale}px` });

const calcGridAttrs = width => ({ class: 'background', style: `width: ${width * scale}px` });

function calcActorAttrs({ type, pos, size }: TActor) {
  const style = {
    top: `${pos.y * scale}px`,
    left: `${pos.x * scale}px`,
    width: `${size.dx * scale}px`,
    height: `${size.dy * scale}px`,
  };
  return { class: `actor ${type}`, style };
}

function renderCell(type: Cell): TElement {
  return renderElement('td', calcCellAttrs(type));
}

function renderRow(row: TRow): TElement {
  const cellElements: TElement[] = row.map(renderCell);
  return renderElement('tr', calcRowAttrs(), ...cellElements);
}

function renderGrid(level: TLevel): TElement {
  const rowElements: TElement[] = level.rows.map(renderRow);
  return renderElement('table', calcGridAttrs(level.width), ...rowElements);
}

function renderActor(actor: TActor): TElement {
  const { style, ...attrs } = calcActorAttrs(actor);
  const actorElement = renderElement('div', attrs);
  actorElement.style.width = style.width;
  actorElement.style.height = style.height;
  actorElement.style.left = style.left;
  actorElement.style.top = style.top;
  return actorElement;
}

function renderActors(actors: TActor[]): TElement {
  const actorElements: TElement[] = actors.map(renderActor);
  return renderElement('div', { class: 'actors' }, ...actorElements);
}

function renderGame(level: TLevel) {
  const gridElement = renderGrid(level);
  return renderElement('div', { class: 'game' }, gridElement);
}
// ------------------------------------------------------------
function constructDisplay(parent: HTMLElement, level: TLevel): TDisplay {
  const dom = renderGame(level);
  parent.appendChild(dom);
  return { dom, actorLayer: null };
}

export function clearDisplay(display: TDisplay) {
  display.dom.remove();
}

export function syncDisplayToState(display: TDisplay, state: TState): TDisplay {
  // console.log('DOMDisplay#syncState =>', display, { state });

  if (display.actorLayer) display.actorLayer.remove();
  display.actorLayer = renderActors(state.actors);

  const { dom } = display;
  dom.appendChild(display.actorLayer);
  dom.className = `game ${state.status}`;

  scrollPlayerIntoView(display, state);

  return display;
}

function scrollPlayerIntoView({ dom }: TDisplay, state: TState): void {
  // console.log('DOMDisplay#scrollPlayerIntoView =>', state);
  const width = dom.clientWidth;
  const height = dom.clientHeight;
  const margin = width / 3;

  // The viewport
  const left = dom.scrollLeft;
  const right = left + width;
  const top = dom.scrollTop;
  const bottom = top + height;

  const player = getPlayer(state);
  const center = coordScale(coordAdd(player.pos, sizeScale(player.size, 0.5)), scale);

  if (center.x < left + margin) {
    dom.scrollLeft = center.x - margin;
  } else if (center.x > right - margin) {
    dom.scrollLeft = center.x + margin - width;
  }
  if (center.y < top + margin) {
    dom.scrollTop = center.y - margin;
  } else if (center.y > bottom - margin) {
    dom.scrollTop = center.y + margin - height;
  }
}

// ------------------------------------------------------------
export function createDisplay(level: TLevel): TDisplay {
  return constructDisplay(document.body, level);
}
