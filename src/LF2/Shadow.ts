import * as THREE from 'three';
import LF2 from './LF2';
import Stage from './stage/Stage';
import { IWorldCallbacks, World } from './World';
import { Entity } from './entity/Entity';


export class Shadow implements IWorldCallbacks {
  readonly entity: Entity;
  readonly world: World;
  readonly lf2: LF2;
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>;

  get position() { return this.mesh.position; }
  get visible() { return this.mesh.visible; }
  set visible(v) { this.mesh.visible = v; }

  constructor(entity: Entity) {
    this.entity = entity;
    this.world = this.entity.world;
    this.lf2 = this.entity.world.lf2;
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0, 0),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    this.mesh.renderOrder = 0
    this.on_stage_change(this.world.stage);
    this.world.callbacks.add(this);
  }

  on_stage_change(stage: Stage): void {
    stage.bg.get_shadow().then(pic => {
      const [sw, sh] = stage.bg.data.base.shadowsize || [30, 30];
      this.mesh.geometry = new THREE.PlaneGeometry(sw, sh);
      this.mesh.material.map = pic.texture;
      this.mesh.material.opacity = 1;
      this.mesh.material.needsUpdate = true;
    });
  }

  dispose(): void {
    this.mesh.removeFromParent();
  }
}
