import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../LF2/PlayerInfo";
import { TPicture } from '../../LF2/loader/loader';
import { SineAnimation } from '../../SineAnimation';
import NumberAnimation from "../../common/animation/NumberAnimation";
import { Defines } from '../../common/lf2_type/defines';
import GamePrepareLogic, { IGamePrepareLogicCallback } from './GamePrepareLogic';
import { LayoutComponent } from "./LayoutComponent";
import LayoutMeshBuilder from "./LayoutMeshBuilder";

/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterHead extends LayoutComponent {
  protected _player_id: string | undefined = void 0;
  protected _player: PlayerInfo | undefined = void 0;
  protected _jid: number = 0;
  protected _mesh_head?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  protected _mesh_hints?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  protected _mesh_countdown?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  protected _head_opacity: NumberAnimation = new NumberAnimation(0, 1, 0, false);
  protected _head: string = Defines.BuiltIn.Imgs.RFACE;
  protected _countdown: string = '';
  protected _hints_opacity: SineAnimation = new SineAnimation(0.75, 1, 1 / 50);

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: () => this.handle_changed(),
    on_character_changed: (character_id): void => {
      const character = character_id ? this.lf2.datas.find_character(character_id) : void 0;
      this._head = character?.base.head || Defines.BuiltIn.Imgs.RFACE;
      this.handle_changed();
    }
  }
  private _game_prepare_logic_listener: Partial<IGamePrepareLogicCallback> = {
    on_countdown: (v) => {
      this._countdown = `sprite/CM${v}.png`;

    },
    on_not_ready: () => {
      this._countdown = '';
    },
    on_asking_com_num: () => {
      this._countdown = '';
    }
  };

  init(...args: string[]): this {
    this._player_id = args[0];
    return this;
  }

  static hint_pic: TPicture | null = null;

  create_hints_mesh() {
    const [w, h] = this.layout.size
    const hint_pic = this.lf2.images.create_pic_by_img_key(Defines.BuiltIn.Imgs.CMA);
    this._mesh_hints = LayoutMeshBuilder.create()
      .center(0.5, 0.5)
      .size(hint_pic.w, hint_pic.h)
      .build({ map: hint_pic.texture, transparent: true });
    this._mesh_hints.position.set(w / 2, -h / 2, 0);
    this.layout.mesh?.add(this._mesh_hints)
    this._mesh_hints.visible = !this._player?.joined
  }

  on_mount(): void {
    super.on_mount();
    this.create_hints_mesh();
    if (!this._player_id) return;
    this._player = this.lf2.player_infos.get(this._player_id);
    if (!this._player) return;
    this._player.callbacks.add(this._player_listener);
    this._player_listener.on_character_changed?.(this._player.character, '');
    GamePrepareLogic.inst?.callbacks.add(this._game_prepare_logic_listener);
  }

  on_unmount(): void {
    super.on_unmount();
    if (!this._player) return;
    this._player.callbacks.del(this._player_listener);
    this.dispose_mesh();
    GamePrepareLogic.inst?.callbacks.del(this._game_prepare_logic_listener);
  }

  protected handle_changed() {

    if (!this._mesh_head && this._player?.joined) {
      this.update_head_mesh(++this._jid, this._head)
    } else {
      this.fade_out();
    }
  }
  protected dispose_mesh() {
    this._mesh_head?.geometry.dispose();
    this._mesh_head?.material.map?.dispose();
    this._mesh_head?.removeFromParent();
    this._mesh_head = void 0;
  }
  protected fade_out() {
    this._head_opacity.play(true);
  }
  protected update_head_mesh(jid: number, src: string) {
    if (jid !== this._jid) return;
    const pic = this.lf2.images.create_pic_by_img_key(src);
    if (jid !== this._jid) {
      pic.texture.dispose();
      return;
    }
    const [w, h] = this.layout.size
    const builder = LayoutMeshBuilder.create().size(w, h);
    if (!this._mesh_head) {
      this._mesh_head = builder.build({ map: pic.texture, transparent: true });
      this._mesh_head.name = PlayerCharacterHead.name
      this.layout.mesh?.add(this._mesh_head);
    } else {
      this._mesh_head.geometry.dispose();
      this._mesh_head.material.map?.dispose();
      this._mesh_head.geometry = builder.build_geometry()
      this._mesh_head.material.map = pic.texture;
      this._mesh_head.material.needsUpdate = true;
    }
  }

  on_render(dt: number): void {
    this._hints_opacity.update(dt)
    if (this._mesh_head) {
      this._mesh_head.material.opacity = this._head_opacity.update(dt);
      this._mesh_head.material.needsUpdate = true;
    }
    if (this._head_opacity.is_finish && this._head_opacity.reverse) {
      if (!this._head || !this._player?.joined) {
        if (this._mesh_hints) this._mesh_hints.visible = true
        this.dispose_mesh();
      } else {
        if (this._mesh_hints) this._mesh_hints.visible = false
        this.update_head_mesh(++this._jid, this._head)
        this._head_opacity.play(false);
      }
    }
    if (this._mesh_hints) {
      this._mesh_hints.material.opacity = this._hints_opacity.value;
    }
  }
}