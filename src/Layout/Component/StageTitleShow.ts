import { ILf2Callback } from "../../LF2/ILf2Callback";
import { IWorldCallbacks } from "../../LF2/IWorldCallbacks";
import Stage from "../../LF2/stage/Stage";
import NumberAnimation from "../../common/animation/NumberAnimation";
import SequenceAnimation from '../../common/animation/SequenceAnimation';
import { is_str } from "../../common/type_check";
import read_nums from "../utils/read_nums";
import { LayoutComponent } from "./LayoutComponent";
import LayoutMeshBuilder from "./LayoutMeshBuilder";

export default class StageTitleShow extends LayoutComponent {
  private _stage?: Stage;
  private _world_listener: Partial<IWorldCallbacks> = {
    on_stage_change: v => {
      this._stage = v;
      this.on_stage_change(v)
    },
  };
  private _lf2_listener: Partial<ILf2Callback> = {
    on_stages_clear: () => this.on_stages_clear()
  }
  private _opactiy: SequenceAnimation = new SequenceAnimation(
    new NumberAnimation(0, 1, 500),
    3000,
    new NumberAnimation(1, 0, 500)
  );
  private _meshs: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[] = [];
  private depose_mesh(mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>) {
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh.removeFromParent();
  }
  private depose_all_mesh() {
    for (const mesh of this._meshs)
      this.depose_mesh(mesh);
    this._meshs.length = 0;
  }

  protected async on_stages_clear() {
    this.lf2.sounds.play_preset('pass')
    this.depose_all_mesh();
    const meshs = [await this.create_mesh(`stage_clear`)]
    const parent_mesh = this.layout.mesh;
    if (!parent_mesh || meshs.indexOf(void 0) >= 0 || !this.mounted) {
      for (const mesh of meshs) mesh && this.depose_mesh(mesh)
      return;
    }

    this._meshs = meshs as any;
    let total_w = 0;
    let total_h = 0;
    for (const mesh of this._meshs) {
      total_w += mesh.userData._w;
      total_h = Math.max(total_h, mesh.userData._h);
    }
    let x = this.layout.w / 2 - total_w / 2;
    let y = -(this.layout.h / 2 - total_h / 2);
    for (const mesh of this._meshs) {
      mesh.position.x = x;
      mesh.position.y = y;
      x += mesh.userData._w;
      parent_mesh.add(mesh);
    }
    this._opactiy.play(false);
  }
  protected async on_stage_change(stage: Stage) {
    this.depose_all_mesh();

    const [, main_num, sub_num] = stage.name.match(/stage (\d*)-(\d*)/) ?? [];
    if (!is_str(main_num) || !is_str(sub_num)) return;
    const meshs = [
      await this.create_mesh(`state_name_prefix`),
      await this.create_mesh(`char_minus`).then(v => { if (v) v.visible = false; return v }),
      await this.create_mesh(`char_num_${main_num}`),
      await this.create_mesh(`char_minus`),
      await this.create_mesh(`char_num_${sub_num}`),
    ]

    const parent_mesh = this.layout.mesh;
    if (!parent_mesh || meshs.indexOf(void 0) >= 0 || this._stage !== stage || !this.mounted) {
      for (const mesh of meshs) mesh && this.depose_mesh(mesh)
      return;
    }

    this._meshs = meshs as any;
    let total_w = 0;
    let total_h = 0;
    for (const mesh of this._meshs) {
      total_w += mesh.userData._w;
      total_h = Math.max(total_h, mesh.userData._h);
    }
    let x = this.layout.w / 2 - total_w / 2;
    let y = -(this.layout.h / 2 - total_h / 2);
    for (const mesh of this._meshs) {
      mesh.position.x = x;
      mesh.position.y = y;
      x += mesh.userData._w;
      parent_mesh.add(mesh);
    }
    this._opactiy.play(false);
  }
  async create_mesh(rect_name: string) {
    const [x, y, w, h] = read_nums(this.layout.get_value(rect_name), 4)
    if (w <= 0 || h <= 0) return;
    const char_num_img = this.layout.get_value('char_num_img');
    if (!is_str(char_num_img)) return;
    const num_pic = await this.lf2.images.create_pic(char_num_img, char_num_img, { src_x: x, src_y: y, src_w: w, src_h: h });
    const num_mesh = LayoutMeshBuilder.create()
      .size(w, h)
      .build({
        map: num_pic.texture,
        transparent: true,
        opacity: 0,
      })
    return num_mesh;
  }

  on_mount(): void {
    super.on_mount();
    this.world.callbacks.add(this._world_listener);
    this.lf2.callbacks.add(this._lf2_listener);
  }

  on_unmount(): void {
    super.on_unmount();
    this.world.callbacks.del(this._world_listener);
    this.lf2.callbacks.del(this._lf2_listener);
    this.depose_all_mesh();
  }

  on_render(dt: number): void {
    if (this._meshs.length) {
      this._opactiy.update(dt);
      for (const m of this._meshs) {
        m.material.opacity = this._opactiy.value;
        m.material.needsUpdate = true;
      }
    }
  }
}