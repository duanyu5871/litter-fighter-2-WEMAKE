import * as T from 'three';
import type { Entity, IEntityCallbacks } from './Entity';
import { get_team_shadow_color } from '../base/get_team_shadow_color';
import { get_team_text_color } from '../base/get_team_text_color';


export class NameSprite implements IEntityCallbacks {
  readonly mesh = new T.Sprite(new T.SpriteMaterial({ visible: false }));

  get position() { return this.mesh.position; }
  get visible() { return this.mesh.visible; }
  set visible(v) { this.mesh.visible = v; }

  constructor(entity: Entity) {
    this.mesh.name = NameSprite.name;
    this.mesh.renderOrder = 0;
    entity.sprite.addEventListener('added', () => this.on_mount(entity));
    entity.sprite.addEventListener('removed', () => this.on_unmount(entity));
  }

  protected on_mount(entity: Entity) {
    entity.world.scene.add(this.mesh);
    entity.callbacks.add(this)
    this.update_name_sprite(entity, entity.name, entity.team)
  }

  protected on_unmount(entity: Entity) {
    this.mesh.removeFromParent();
    entity.callbacks.del(this)
  }

  on_name_changed(entity: Entity, name: string): void {
    this.update_name_sprite(entity, name, entity.team)
  }

  on_team_changed(entity: Entity, team: number): void {
    this.update_name_sprite(entity, entity.name, team)
  }

  private update_name_sprite(e: Entity, name: string, team: number) {
    const fillStyle = get_team_text_color(team)
    const strokeStyle = get_team_shadow_color(team);
    const world = e.world;
    const lf2 = world.lf2;
    if (!name) {
      this.mesh.material.visible = false;
      this.mesh.material.map = null;
      return;
    }
    lf2.img_mgr.load_text(name, { shadowColor: strokeStyle, fillStyle })
      .then((i) => lf2.img_mgr.create_picture_by_img_key('', i.key))
      .then((p) => {
        if (name !== e.name) return;
        if (team !== e.team) return;

        this.mesh.material.visible = true;
        this.mesh.material.map = p.texture;
        this.mesh.material.needsUpdate = true;

        this.mesh.scale.set(p.i_w, p.i_h, 1);
        this.mesh.name = 'name sprite'
        this.mesh.center.set(0.5, 1.5);
      });
  }
}
