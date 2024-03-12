import * as THREE from 'three';
import { Background, BgLayer } from './G/Background';
import { World } from './G/World';
import { PlayerController } from "./G/controller/PlayerController";
import './G/entity/Ball';
import { Character } from './G/entity/Character';
import { Entity } from './G/entity/Entity';
import { Weapon } from './G/entity/Weapon';
import { dat_mgr } from './G/loader/DatLoader';
import { Log } from './Log';
import random_get from './Utils/random_get';
import { IBgData, ICharacterData, TFace } from './js_utils/lf2_type';
let _new_id = 0;
const new_id = () => '' + (++_new_id);

export default function run(canvas: HTMLCanvasElement, on_load?: () => void) {
  let disposed = false;
  const disposers: (() => void)[] = []

  let _character: Character | undefined;
  dat_mgr.load().then(() => {
    if (disposed) return;
    on_load?.()
    change_bg()
    const lf2: any = (window as any).lf2 = {
      clear() {
        world.del_entities(...world.entities)
      },
      play_character,
      change_bg: change_bg,
      add_random_weapons(count = 10) {
        while (--count >= 0) {
          const d = random_get(dat_mgr.weapons);
          const e = new Weapon(world, d)
          random_entity_info(e);
          e.attach();
        }
      },
      add_random_characters(count = 10) {
        while (--count >= 0) {
          const d = random_get(dat_mgr.characters);
          const e = new Character(world, d);
          random_entity_info(e);
          e.attach();
        }
      }
    };
    const random_entity_info = (e: Entity) => {
      e.id = new_id();
      e.facing = Math.floor(Math.random() * 100) % 2 ? -1 : 1
      e.position.x = world.left + Math.random() * (world.right - world.left);
      e.position.z = world.far + Math.random() * (world.near - world.far);
      e.position.y = 550;
      return e;
    }
    for (const d of dat_mgr.characters) {
      lf2['add_' + d.base.name.toLowerCase()] = (v = 1) => {
        while (--v >= 0) {
          const e = new Character(world, d);
          random_entity_info(e).attach();
        }
      }
    }
    for (const d of dat_mgr.weapons) {
      lf2['add_' + d.base.name.toLowerCase()] = (v = 1) => {
        while (--v >= 0) {
          const e = new Weapon(world, d);
          random_entity_info(e).attach();
        }
      }
    }
  })

  const world = (window as any).world = new World(canvas);
  const play_character = (next: boolean | string = true) => {
    if (disposed) return;
    let data: ICharacterData | undefined = void 0;
    if (typeof next === 'boolean') {
      const idx = dat_mgr.characters.findIndex(v => v === _character?.data) + (next ? 1 : (dat_mgr.characters.length - 1));
      data = dat_mgr.characters[idx % dat_mgr.characters.length];
    } else {
      data = dat_mgr.characters.find(v => v.id == next)
    }
    if (!data) return;
    let x = 0;
    let y = 0;
    let z = 0;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    let face: TFace = 1;
    let frame_id = '0';
    if (_character) {
      x = _character.position.x;
      y = _character.position.y;
      z = _character.position.z;
      vx = _character.velocity.x;
      vy = _character.velocity.y;
      vz = _character.velocity.z;
      face = _character.facing;
      frame_id = _character.get_frame().id;
      _character.dispose()
    }


    _character = new Character(world, data)
    _character.id = new_id();
    _character.position.x = x;
    _character.position.y = y;
    _character.position.z = z;
    _character.velocity.x = vx;
    _character.velocity.y = vy;
    _character.velocity.z = vz;
    _character.facing = face;
    _character.enter_frame(frame_id)
    _character.controller = new PlayerController(_character)
    _character.attach();
  }
  const change_bg = (next: boolean | string = true) => {
    let data: IBgData | undefined;
    const list = dat_mgr.backgrounds
    if (typeof next === 'boolean') {
      const curr_data = world.bg?.data
      const len = list.length;
      const idx = list.findIndex(v => v === curr_data) + (next ? 1 : (len - 1));
      data = list[idx % len];
    } else {
      data = list.find(v => v.id == next);
    }
    if (!data) return;
    world.bg = new Background(world, data)
  }

  world.start_update();
  world.start_render();
  const on_key_down = (e: KeyboardEvent) => {
    const interrupt = () => {
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    switch (e.key?.toUpperCase()) {
      case 'ARROWUP': {
        if (e.shiftKey) play_character(false);
        else if (e.altKey) change_bg(false);
        else break;
        interrupt();
        break;
      }
      case 'ARROWDOWN': {
        if (e.shiftKey) play_character(true);
        else if (e.altKey) change_bg(true);
        else break;
        interrupt();
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
  window.addEventListener('keydown', on_key_down)
  disposers.push(() => window.removeEventListener('keydown', on_key_down))

  let intersection: THREE.Intersection | undefined = void 0;
  const pick_intersection = (next: THREE.Intersection | undefined) => {
    const old = intersection;
    if (old) {
      const o = old.object;
      if (o.userData.owner instanceof BgLayer)
        o.userData.owner.show_indicators = false;
      else if (o.userData.owner instanceof Entity)
        o.userData.owner.show_indicators = false;
      else if (o instanceof THREE.Mesh)
        o.material.color.set(0xffffff)
      else if (o instanceof THREE.Sprite)
        o.material.color.set(0xffffff)
    }
    intersection = next;

    if (!next) return;
    const o = next.object;
    Log.print("click", o.userData.owner ?? o.userData)
    if (o.userData.owner instanceof BgLayer)
      o.userData.owner.show_indicators = true;
    else if (o.userData.owner instanceof Entity)
      o.userData.owner.show_indicators = true;
    else if (o instanceof THREE.Mesh)
      o.material.color.set(0xff0000)
    else if (o instanceof THREE.Sprite)
      o.material.color.set(0xff0000)
  }

  const on_pointer_down = (e: PointerEvent) => {
    const { offsetX: x, offsetY: y } = e;
    const coords = new THREE.Vector2(
      (x / canvas.width) * 2 - 1,
      -(y / canvas.height) * 2 + 1
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(coords, world.camera)
    const intersections = raycaster.intersectObjects(world.scene.children);
    if (!intersections.length) {
      pick_intersection(void 0)
    } else {
      if (intersection) {
        const idx = intersections.findIndex(v => v.object === intersection?.object);
        const iii = intersections.find((v, i) => i > idx && v.object.userData.owner);
        pick_intersection(iii)
      } else {
        const iii = intersections.find(v => v.object.userData.owner)
        pick_intersection(iii)
      }
    }
  }
  canvas.addEventListener('pointerdown', on_pointer_down)
  disposers.push(() => canvas.removeEventListener('pointerdown', on_pointer_down))

  const on_pointer_up = (e: PointerEvent) => {
    // if (intersection) {
    //   if (intersection.object instanceof THREE.Mesh)
    //     intersection.object.material.color.set(0xffffff)
    // }
  }
  canvas.addEventListener('pointerup', on_pointer_up)
  disposers.push(() => canvas.removeEventListener('pointerup', on_pointer_up))


  return {
    play_character,
    change_bg,
    renderer: world.renderer,
    camera: world.camera,
    release() {
      canvas.removeEventListener('pointerdown', on_pointer_down)
      window.removeEventListener('keydown', on_key_down)
      world.dispose()
      dat_mgr.clear();
    }
  }
}

