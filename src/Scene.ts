import { dat_mgr } from './G/loader/DatLoader';
import { Character } from './G/entity/Character';
import { PlayerController } from "./G/controller/PlayerController";
import { World } from './G/World';
import random_get from './Utils/random_get';
import { TFace, TFrameId } from './js_utils/lf2_type';
import * as THREE from 'three';
import './G/entity/Ball';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect'
import { TestController } from './G/controller/TestController';
import { Entity } from './G/entity/Entity';
let character_id = 1;

export default function run(canvas: HTMLCanvasElement) {
  let disposed = false;
  const disposers: (() => void)[] = []

  let _character_idx = 0;
  let _character: Character | undefined;
  dat_mgr.load().then(() => {
    if (disposed) return;

    const lf2: any = (window as any).lf2 = {};

    for (const d of dat_mgr.characters) {
      lf2['add_' + d.base.name.toLowerCase()] = () => {
        const e = new Character(world, d);
        e.position.x = Math.random() * world.width;
        e.position.z = Math.random() * world.depth;
        e.attach();
      }
    }

    play_character(_character_idx);
    for (let i = 0; i < 1; ++i) {
      const d = random_get(dat_mgr.characters);
      const e = new Character(world, d)
      if (i === 0)
        e.controller = new TestController(e);
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
  const on_key_down = (e: KeyboardEvent) => {
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

  window.addEventListener('keydown', on_key_down)
  disposers.push(() => window.removeEventListener('keydown', on_key_down))

  let intersection: THREE.Intersection | undefined = void 0;
  const pick_intersection = (next: THREE.Intersection | undefined) => {
    console.log(next);
    const old = intersection;
    if (old) {
      const o = old.object;
      if (o instanceof THREE.Mesh)
        o.material.color.set(0xffffff)
      else if (o instanceof THREE.Sprite)
        o.material.color.set(0xffffff)
      if (o.userData.owner instanceof Entity)
        o.userData.owner.show_indicators = false;
    }
    intersection = next;

    if (!next) return;
    const o = next.object;
    if (o instanceof THREE.Mesh)
      o.material.color.set(0xff0000)
    else if (o instanceof THREE.Sprite)
      o.material.color.set(0xff0000)

    if (o.userData.owner instanceof Entity)
      o.userData.owner.show_indicators = true;

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
        if(iii === intersection) alert('wtf?')
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

