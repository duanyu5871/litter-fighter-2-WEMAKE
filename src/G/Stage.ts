import { IBgData, IStageInfo } from "../js_utils/lf2_type";
import { Defines } from "../js_utils/lf2_type/defines";
import { Background } from "./Background";
import type { World } from "./World";
import DatMgr from "./loader/DatMgr";

export default class Stage {
  readonly world: World;
  readonly data: IStageInfo;
  readonly bg: Background;
  get left() { return this.bg.left }
  get right() { return this.bg.right }
  get near() { return this.bg.near }
  get far() { return this.bg.far }
  get width() { return this.bg.width }
  get depth() { return this.bg.depth };
  get middle() { return this.bg.middle }

  constructor(world: World, data: IStageInfo | IBgData) {
    this.world = world;
    if ('type' in data && data.type === 'background') {
      this.data = Defines.THE_VOID_STAGE;
      this.bg = new Background(world, data);
    } else if ('bg' in data) {
      this.data = data;
      const bg_data = this.world.lf2.dat_mgr.backgrounds.find(v => v.id === 'bg_' + this.data.bg)// FIXME;
      this.bg = new Background(world, bg_data ?? Defines.THE_VOID_BG);
    } else {
      this.data = Defines.THE_VOID_STAGE;
      this.bg = new Background(world, Defines.THE_VOID_BG);
    }
  }
  dispose() {
    this.bg.dispose()
  }
}