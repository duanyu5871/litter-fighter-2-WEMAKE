import { dat_mgr } from './G/loader/DatLoader';
import { Character } from './G/entity/Character';
import { PlayerController } from "./G/controller/PlayerController";
import { World } from './G/World';
import random_get from './Utils/random_get';
import { TFace, TFrameId } from './js_utils/lf2_type';

import './G/entity/Ball';
import { DDDController } from './G/controller/DDDController';
let character_id = 1;

export default function run(canvas: HTMLCanvasElement) {
  let disposed = false;

  let _character_idx = 0;
  let _character: Character | undefined;
  dat_mgr.load().then(() => {
    if (disposed) return;

    play_character(_character_idx);
    for (let i = 0; i < 1; ++i) {
      const d = random_get(dat_mgr.characters);
      const e = new Character(world, d)
      if (i === 0)
        e.controller = new DDDController(e);
      e.id = '' + character_id;
      e.position.x = Math.random() * world.width;
      e.position.z = Math.random() * world.depth;
      e.attach();
    }
  })

  const world = (window as any).world = new World(canvas);
  const play_character = (idx: number) => {
    if (disposed) return;
    let x = 0;
    let y = 0;
    let z = 0;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    let face: TFace = 1;
    let frame_id: TFrameId = 0;
    if (_character) {
      x = _character.position.x;
      y = _character.position.y;
      z = _character.position.z;
      vx = _character.velocity.x;
      vy = _character.velocity.y;
      vz = _character.velocity.z;
      face = _character.face;
      frame_id = _character.get_frame().id;
      _character.dispose()
    }
    const data = dat_mgr.characters[idx];
    if (!data) return;
    _character = new Character(world, data)
    _character.id = '' + (++character_id)
    _character.position.x = x;
    _character.position.y = y;
    _character.position.z = z;
    _character.velocity.x = vx;
    _character.velocity.y = vy;
    _character.velocity.z = vz;
    _character.face = face;
    _character.enter_frame(frame_id)
    _character.controller = new PlayerController(_character)
    _character.attach();
  }


  world.start_update();
  world.start_render();
  const eee = (e: KeyboardEvent) => {
    const interrupt = () => {
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    switch (e.key?.toUpperCase()) {
      case 'ARROWUP': {
        if (!e.shiftKey) break;
        interrupt();
        const l = dat_mgr.characters.length;
        if (!l) break;
        _character_idx = (_character_idx + 1) % l;
        play_character(_character_idx)
        break;
      }
      case 'ARROWDOWN': {
        if (!e.shiftKey) break;
        interrupt();
        const l = dat_mgr.characters.length;
        if (!l) break;
        _character_idx = (_character_idx + l - 1) % l;
        play_character(_character_idx)
        break;
      }
      case 'F2':
        interrupt();
        if (!world.paused) world.paused = true;
        else world.update_once()
        break;
      case 'F1':
        interrupt();
        world.paused = !world.paused;
        break;
      case 'F5':
        interrupt();
        world.playrate = world.playrate === 100 ? 1 : 100;
        break;
      case 'F6':
        interrupt();
        world.show_indicators = !world.show_indicators;
        break;
    }
  }
  window.addEventListener('keydown', eee)
  return {
    renderer: world.renderer,
    camera: world.camera,
    release() {
      window.removeEventListener('keydown', eee)
      world.dispose()
      dat_mgr.clear();
    }
  }
}

