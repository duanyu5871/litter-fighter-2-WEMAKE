import Character from './G/Character';
import PlayerController from "./G/Controller/PlayerController";
import { TData } from './G/Entity';
import World from './G/World';
import { load_sound } from './G/loader/loader';
import preprocess_data from './G/loader/preprocess_data';
import random_get from './Utils/random_get';
import { arithmetic_progression } from './js_utils/arithmetic_progression';
import { ICharacterData, TFace, TFrameId } from './js_utils/lf2_type';


let character_id = 1;
export default function run(canvas: HTMLCanvasElement) {
  let disposed = false;

  const characters = [
    import('./G/data/template.json'),
    import('./G/data/julian.json'),
    import('./G/data/firzen.json'),
    import('./G/data/louisEX.json'),
    import('./G/data/bat.json'),
    import('./G/data/justin.json'),
    import('./G/data/knight.json'),
    import('./G/data/jan.json'),
    import('./G/data/monk.json'),
    import('./G/data/sorcerer.json'),
    import('./G/data/jack.json'),
    import('./G/data/mark.json'),
    import('./G/data/hunter.json'),
    import('./G/data/bandit.json'),
    import('./G/data/deep.json'),
    import('./G/data/john.json'),
    import('./G/data/henry.json'),
    import('./G/data/rudolf.json'),
    import('./G/data/louis.json'),
    import('./G/data/firen.json'),
    import('./G/data/freeze.json'),
    import('./G/data/dennis.json'),
    import('./G/data/woody.json'),
    import('./G/data/davis.json')
  ]
  let character_idx = 0;
  let _datas: TData[] | undefined;
  let _character: Character | undefined;
  Promise.all([
    import('./G/spark.json'),
    import('./G/data/etc.json'),
    ...characters
  ]).then(arr => {
    arithmetic_progression(1, 102).forEach(n => {
      const p = n < 10 ?
        `data/00${n}.wav` :
        n < 100 ?
          `data/0${n}.wav` :
          `data/${n}.wav`;
      load_sound(p, require(`./G/${p}`))
    })
    return Promise.all(arr.map(v => preprocess_data(v)))
  }).then((datas) => {
    if (disposed) return;
    _datas = datas.filter(v => v.type === 'character');
    play_character(character_idx);

    for (let i = 0; i < 100; ++i) {
      const d = random_get(_datas);
      if (!d || d.type !== 'character') { continue; }
      const e = new Character(world, d as ICharacterData)
      e.id = '' + character_id;
      e.position.x = Math.random() * world.width;
      e.position.z = Math.random() * world.depth;
      e.attach();
    }

  })

  const world = new World(canvas);
  const play_character = (idx: number) => {
    if (!_datas || disposed) return;
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
    const d = _datas[idx];
    if (d.type !== 'character') {
      return;
    }
    _character = new Character(world, d as ICharacterData)
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
      case 'ARROWUP':
        if (!e.shiftKey) break;
        interrupt();
        character_idx = (character_idx + 1) % characters.length;
        play_character(character_idx)
        break;
      case 'ARROWDOWN':
        if (!e.shiftKey) break;
        interrupt();
        character_idx = (character_idx + characters.length - 1) % characters.length;
        play_character(character_idx)
        break;
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
    }
  }
}

