import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../LF2/PlayerInfo";
import { Warn } from '../../Log';
import NumberAnimation from "../../common/animation/NumberAnimation";
import { SineAnimation } from '../../SineAnimation';
import { LayoutComponent } from "./LayoutComponent";
import LayoutMeshBuilder from "./LayoutMeshBuilder";
import GamePrepareLogic, { IGamePrepareLogicCallback } from './GamePrepareLogic';
import { TPicture } from '../../LF2/loader/loader';

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
  protected _mesh_head: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _mesh_hints: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _mesh_countdown: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _head_opacity: NumberAnimation = new NumberAnimation(0, 1, 0, false);
  protected _head: string = 'sprite/RFACE.png';
  protected _countdown: string = '';
  protected _hints_opacity: SineAnimation = new SineAnimation(0.75, 1, 1 / 50);

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: () => this.handle_changed(),
    on_character_changed: (character_id): void => {
      const character = character_id ? this.lf2.dat_mgr.find_character(character_id) : void 0;
      this._head = character?.base.head || 'sprite/RFACE.png';
      this.handle_changed();
    }
  }
  private _game_prepare_logic_listener: Partial<IGamePrepareLogicCallback> = {
    on_countdown: (v) => {
      if (this._player?.joined) return;
      this._countdown = `sprite/CM+${v}+.png`;
    }
  };

  init(...args: string[]): this {
    this._player_id = args[0];
    return this;
  }

  static hint_pic: TPicture | null = null;

  async create_hints_mesh() {
    const [w, h] = this.layout.size
    const hint_pic = await this.lf2.img_mgr.create_pic_by_src('sprite/CMA.png');
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
      this.update_head_mesh(++this._jid, this._head).catch(e => console.error(e))
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
  protected async update_head_mesh(jid: number, src: string) {
    if (jid !== this._jid) return;
    const pic = await this.lf2.img_mgr.create_pic_by_src(src);
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
        this.update_head_mesh(++this._jid, this._head).catch(e => Warn.print(PlayerCharacterHead.name, 'failed to update head, reason:', e))
        this._head_opacity.play(false);
      }
    }
    if (this._mesh_hints) {
      this._mesh_hints.material.opacity = this._hints_opacity.value;
    }
  }
}