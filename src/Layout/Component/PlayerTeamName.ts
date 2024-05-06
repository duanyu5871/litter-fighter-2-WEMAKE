import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../LF2/PlayerInfo";
import { Warn } from '../../Log';
import NumberAnimation from "../../NumberAnimation";
import { Defines } from '../../common/lf2_type/defines';
import { LayoutComponent } from "./LayoutComponent";
import { TextBuilder } from './TextBuilder';

/**
 * 显示玩家队伍名
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerTeamName extends LayoutComponent {
  protected _player_id: string | undefined = void 0;
  protected _player: PlayerInfo | undefined = void 0;
  protected _jid: number = 0;
  protected _mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _head_opacity: NumberAnimation = new NumberAnimation(0, 1, 0, false);
  protected _team_name: string | undefined = void 0;

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_character_decided: () => this.handle_changed(),
    on_team_decided: () => this.handle_changed(),
    on_team_changed: (team) => {
      this._team_name = Defines.TeamInfoMap[team]?.name;
      this.handle_changed();
    },
  }

  init(...args: string[]): this {
    this._player_id = args[0];
    return this;
  }

  on_mount(): void {
    if (!this._player_id) return;
    this._player = this.lf2.player_infos.get(this._player_id);
    if (!this._player) return;
    this._player.callbacks.add(this._player_listener);
    this._team_name = Defines.TeamInfoMap[this._player.team]?.name;
    this.handle_changed();
  }

  on_unmount(): void {
    if (!this._player) return;
    this._player.callbacks.del(this._player_listener);
    this.dispose_mesh();
  }

  protected handle_changed() {
    if (!this._mesh && this._player?.character_decided && this._team_name) {
      this.update_team_name_mesh(++this._jid, this._team_name).catch(e => console.error(e))
    } else {
      this.fade_out();
    }
  }

  protected dispose_mesh() {
    this._mesh?.geometry.dispose();
    this._mesh?.material.map?.dispose();
    this._mesh?.removeFromParent();
    this._mesh = void 0;
  }

  protected fade_out() {
    this._head_opacity.play(true);
  }

  protected async update_team_name_mesh(jid: number, name: string) {
    if (jid !== this._jid) return;
    const [w, h] = this.layout.size

    const builder = TextBuilder.get(this.lf2)
      .pos(w / 2, -h / 2)
      .center(0.5, 0.5)
      .text(name)
      .style({
        fillStyle: 'white',
        font: 'bold 14px Arial',
      });
    if (!this._mesh) {
      const mesh = await builder.build_mesh();
      if (jid !== this._jid) {
        mesh.geometry.dispose();
        mesh.material.dispose();
        return;
      }
      this._mesh = mesh;
      this._mesh.name = PlayerTeamName.name
      this.layout.sprite?.add(this._mesh);
    } else {
      const [geo, tex] = await builder.build();
      if (jid !== this._jid) {
        geo.dispose();
        tex.dispose();
        return;
      }
      this._mesh.geometry.dispose();
      this._mesh.material.map?.dispose();
      this._mesh.geometry = geo
      this._mesh.material.map = tex;
      this._mesh.material.needsUpdate = true;
    }
  }

  on_render(dt: number): void {
    if (this._mesh) {
      this._mesh.material.opacity = this._head_opacity.update(dt);
      this._mesh.material.needsUpdate = true;
    }
    if (this._head_opacity.is_finish && this._head_opacity.reverse) {
      if (!this._team_name || !this._player?.character_decided) {
        this.dispose_mesh();
      } else {
        this.update_team_name_mesh(++this._jid, this._team_name).catch(e => Warn.print(PlayerTeamName.name, 'failed to update player team name, reason:', e))
        this._head_opacity.play(false);
      }
    }
  }
}