import { Key, TKeymap } from './typedefs';

const keys = [Key.arrowLeft, Key.arrowRight, Key.arrowUp];

export let gKeymap: TKeymap;

function handleKeyboardEvent(event: KeyboardEvent) {
  if (keys.includes(event.key as Key)) {
    gKeymap[event.key] = event.type === 'keydown';
    event.preventDefault();
  }
}

function getKeymap(): TKeymap {
  return gKeymap;
}

function putKeymap(keymap: TKeymap): void {
  gKeymap = keymap;
}

export function startKeyboardListener(): () => TKeymap {
  putKeymap(Object.create(null));
  window.addEventListener('keydown', handleKeyboardEvent);
  window.addEventListener('keyup', handleKeyboardEvent);
  return getKeymap;
}
