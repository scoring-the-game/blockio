import { coordAdd, coordScale } from './coord';
import { sizeScale } from './size';
import { TLevel } from './level';
import { TActor } from './actors';
import { TState, getPlayer } from './state';

// ------------------------------------------------------------
export interface IDisplay {
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

// ------------------------------------------------------------
export class DOMDisplay implements IDisplay {
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
    let center = coordScale(coordAdd(player.pos, sizeScale(player.size, 0.5)), scale);

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
export function constructDisplay(level: TLevel): IDisplay {
  return new DOMDisplay(document.body, level);
}
