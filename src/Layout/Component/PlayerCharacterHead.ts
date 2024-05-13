import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../LF2/PlayerInfo";
import { TPicture } from '../../LF2/loader/loader';
import { SineAnimation } from '../../SineAnimation';
import NumberAnimation from "../../common/animation/NumberAnimation";
import { Defines } from '../../common/lf2_type/defines';
import GamePrepareLogic, { GamePrepareState, IGamePrepareLogicCallback } from './GamePrepareLogic';
import { LayoutComponent } from "./LayoutComponent";
import MeshBuilder from "./LayoutMeshBuilder";

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
  protected _mesh_cd?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>
  protected _head: string = Defines.BuiltIn.Imgs.RFACE;
  get gpl(): GamePrepareLogic | undefined {
    return this.layout.root.find_component(GamePrepareLogic)
  };

  get joined(): boolean { return true === this._player?.joined }

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: () => this.handle_changed(),
    on_character_changed: (character_id): void => {
      const character = character_id ? this.lf2.datas.find_character(character_id) : void 0;
      this._head = character?.base.head || Defines.BuiltIn.Imgs.RFACE;
      this.handle_changed();
    }
  }
  private _game_prepare_logic_listener: Partial<IGamePrepareLogicCallback> = {
    on_countdown: (seconds) => {
      if (this.joined || !seconds) {
        this.release_countdown_mesh();
        return;
      }
      const pic = this.lf2.images.create_pic_by_img_key(`sprite/CM${seconds}.png`);
      const [w, h] = this.layout.size;
      const builder = MeshBuilder.create()
        .center(0.5, 0.5)
        .size(pic.w, pic.h)
      if (!this._mesh_cd) {
        this._mesh_cd = builder.build({ map: pic.texture, transparent: true });
        this._mesh_cd.position.set(w / 2, -h / 2, 0);
        this._mesh_cd.name = 'countdown'
        this.layout.mesh?.add(this._mesh_cd);
      } else {
        this._mesh_cd.geometry.dispose();
        this._mesh_cd.material.map?.dispose();
        this._mesh_cd.geometry = builder.build_geometry();
        this._mesh_cd.material.map = pic.texture;
        this._mesh_cd.material.needsUpdate = true;
      }

    },
    on_all_ready: () => {
      if (this._mesh_hints) this._mesh_hints.visible = false;
    },
    on_not_ready: () => {
      this.release_countdown_mesh();
      if (this._mesh_hints && !this._player?.joined) this._mesh_hints.visible = true;
    },
    on_asking_com_num: () => {
      this.release_countdown_mesh();
      if (this._mesh_hints && !this._player?.joined) this._mesh_hints.visible = true;
    }
  };

  init(...args: string[]): this {
    this._player_id = args[0];
    return this;
  }

  static hint_pic: TPicture | null = null;
  protected release_countdown_mesh(): void {
    this._mesh_cd?.removeFromParent();
    this._mesh_cd?.geometry.dispose();
    this._mesh_cd?.material.map?.dispose();
    this._mesh_cd?.material.dispose();
    this._mesh_cd = void 0;
  }
  create_hints_mesh() {
    const [w, h] = this.layout.size
    const hint_pic = this.lf2.images.create_pic_by_img_key(Defines.BuiltIn.Imgs.CMA);
    this._mesh_hints = MeshBuilder.create()
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

    this.gpl?.callbacks.add(this._game_prepare_logic_listener);
  }

  on_unmount(): void {
    super.on_unmount();
    if (!this._player) return;
    this._player.callbacks.del(this._player_listener);
    this.dispose_mesh();
    this.gpl?.callbacks.del(this._game_prepare_logic_listener);
  }

  protected handle_changed() {
    this.update_head_mesh(++this._jid, this._head)
  }
  protected dispose_mesh() {
    this._mesh_head?.geometry.dispose();
    this._mesh_head?.material.map?.dispose();
    this._mesh_head?.removeFromParent();
    this._mesh_head = void 0;
  }
  protected update_head_mesh(jid: number, src: string) {
    if (jid !== this._jid) return;
    const pic = this.lf2.images.create_pic_by_img_key(src);
    if (jid !== this._jid) {
      pic.texture.dispose();
      return;
    }
    const [w, h] = this.layout.size
    const builder = MeshBuilder.create().size(w, h);
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
    const joined = this.joined;
    switch (this.gpl?.state) {
      case GamePrepareState.PlayerCharacterSelecting:
        if (this._mesh_hints) this._mesh_hints.visible = !joined
        if (this._mesh_head) this._mesh_head.visible = joined;
        if (this._mesh_cd) this._mesh_cd.visible = false;
        break;
      case GamePrepareState.CountingDown:
        if (this._mesh_hints) this._mesh_hints.visible = false
        if (this._mesh_head) this._mesh_head.visible = joined;
        if (this._mesh_cd) this._mesh_cd.visible = !joined;
        break;
      case GamePrepareState.ComputerNumberSelecting:
      case GamePrepareState.ComputerCharacterSelecting:
      case GamePrepareState.GameSetting:
        if (this._mesh_hints) this._mesh_hints.visible = false
        if (this._mesh_head) this._mesh_head.visible = joined;
        if (this._mesh_cd) this._mesh_cd.visible = false;
        break;
    }
  }
}