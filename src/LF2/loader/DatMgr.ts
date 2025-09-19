import { LF2 } from "../LF2";
import { BallController } from "../controller/BallController";
import { BotController } from "../bot/BotController";
import { InvalidController } from "../controller/InvalidController";
import { IBgData, IDataLists, IStageInfo } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { IDataMap } from "../defines/IDataMap";
import { IEntityData } from "../defines/IEntityData";
import { Defines } from "../defines/defines";
import { Ditto } from "../ditto";
import { Factory } from "../entity";
import { TData } from "../entity/Entity";
import {
  is_ball_data,
  is_bg_data,
  is_character_data,
  is_entity_data,
  is_weapon_data,
} from "../entity/type_check";
import { is_str, is_non_blank_str } from "../utils/type_check";
import { check_stage_info as check_stage_info } from "./check_stage_info";
import { preprocess_bg_data } from "./preprocess_bg_data";
import { preprocess_entity_data } from "./preprocess_entity_data";

export interface IDataListMap {
  background: IBgData[];
  [EntityEnum.Entity]: IEntityData[];
  [EntityEnum.Fighter]: IEntityData[];
  [EntityEnum.Weapon]: IEntityData[];
  [EntityEnum.Ball]: IEntityData[];
  all: TData[];
}

const create_data_list_map = (): IDataListMap => ({
  background: [Defines.VOID_BG],
  [EntityEnum.Entity]: [],
  [EntityEnum.Fighter]: [],
  [EntityEnum.Weapon]: [],
  [EntityEnum.Ball]: [],
  all: [],
});

class Inner {
  readonly mgr: DatMgr;
  readonly id: number;
  get cancelled(): boolean {
    return this.mgr.inner_id !== this.id;
  }
  data_list_map = create_data_list_map();
  data_map = new Map<string, IEntityData>();
  stages: IStageInfo[] = [Defines.VOID_STAGE];
  get lf2() {
    return this.mgr.lf2;
  }

  constructor(mgr: DatMgr, id: number) {
    this.mgr = mgr;
    this.id = id;
  }

  private async _cook_data(data: TData): Promise<TData> {
    const jobs: Promise<any>[] = [];
    if (is_bg_data(data)) data = preprocess_bg_data(this.lf2, data, jobs)
    if (is_ball_data(data))
      Factory.inst.set_ctrl_creator(data.id, (a, b) => new BallController(a, b));
    else if (is_weapon_data(data))
      Factory.inst.set_ctrl_creator(data.id, (a, b) => new InvalidController(a, b));
    else if (is_character_data(data))
      Factory.inst.set_ctrl_creator(data.id, (a, b) => new BotController(a, b));

    if (is_entity_data(data)) data = await preprocess_entity_data(this.lf2, data, jobs);
    return data;
  }

  private async _add_data(index_id: string | number, raw_data: TData) {
    const data = (await this._cook_data(raw_data)) as IEntityData; // fixme
    const _index_id = "" + index_id;
    const _data_id = "" + data.id;
    if (_data_id === "spark") debugger;
    if (_data_id !== _index_id) {
      Ditto.warn(
        DatMgr.TAG + "::_add_data",
        `index_id not equal to data_id,`,
        `index_id: ${_index_id}, data_id: ${_data_id},`,
        `will use index_id as data key.`,
      );
    }
    if (this.data_map.has(_index_id)) {
      Ditto.warn(
        DatMgr.TAG + "::_add_data",
        "id duplicated, old data will be overwritten!",
        "old data:",
        this.data_map.get(_index_id),
        "new data:",
        data,
      );
    }
    this.data_map.set(_index_id, data);
  }

  async load() {
    for (const k of Object.keys(Defines.BuiltIn_Imgs)) {
      const src = (Defines.BuiltIn_Imgs as any)[k];
      if (!is_non_blank_str(src)) continue;
      this.lf2.on_loading_content(`${src}`, 0);
      await this.lf2.images.load_img(src, src);
    }

    for (const k of Object.keys(Defines.BuiltIn_Dats)) {
      const src = (Defines.BuiltIn_Dats as any)[k];
      if (!is_non_blank_str(src)) continue;
      this.lf2.on_loading_content(`${src}`, 0);
      await this._add_data(src, await this.lf2.import_json(src).then(r => r[0]));
    }

    const { objects = [], backgrounds = [] } =
      await this.lf2.import_json<Partial<IDataLists>>("data/data.json5").then(r => r[0])
        .catch(() => ({} as Partial<IDataLists>));
    if (this.cancelled) throw new Error("cancelled");

    if (this.cancelled) throw new Error("cancelled");
    for (const { id, file } of objects) {
      if (this.cancelled) throw new Error("cancelled");

      this.lf2.on_loading_content(`${file}`, 0);
      await this._add_data(id, await this.lf2.import_json(file).then(r => r[0]));
    }
    for (const { id, file } of backgrounds) {
      if (this.cancelled) throw new Error("cancelled");
      this.lf2.on_loading_content(`${file}`, 0);
      await this._add_data(id, await this.lf2.import_json(file).then(r => r[0]));
    }
    for (const [, v] of this.data_map) {
      if (this.cancelled) throw new Error("cancelled");
      const t = v.type as keyof IDataMap;
      this.data_list_map[t]?.push(v as any);
      this.data_list_map.all.push(v as any);
    }

    const stage_file = "data/stage.json";
    this.lf2.on_loading_content(`${stage_file}`, 0);

    const stages = await this.lf2.import_json<IStageInfo[]>("data/stage.json").then(r => r[0]).catch(e => [])

    if (!this.stages.find(v => v.id === Defines.VOID_STAGE.id))
      this.stages.unshift(Defines.VOID_STAGE)

    for (const stage of stages) {
      const idx = this.stages.findIndex(v => v.id === stage.id);
      check_stage_info(stage)
      if (idx < 0) this.stages.push(stage);
      this.stages[idx] = stage;
    }



    this.lf2.on_loading_content(`${stage_file}`, 100);
  }
  process_entity_data(data: IEntityData): void { }
}

export default class DatMgr {
  static readonly TAG: string = "DatMgr";

  find_group(group: string) {
    return {
      characters: this.characters.filter(
        (v) => v.base.group && v.base.group.indexOf(group) >= 0,
      ),
      weapons: this.weapons.filter(
        (v) => v.base.group && v.base.group.indexOf(group) >= 0,
      ),
      entity: this.entity.filter(
        (v) => v.base.group && v.base.group.indexOf(group) >= 0,
      ),
    };
  }
  private _inner_id: number = 0;
  private _inner = new Inner(this, ++this._inner_id);
  get inner_id(): number {
    return this._inner_id;
  }
  readonly lf2: LF2;

  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }

  load(): Promise<void> {
    this.clear();
    return this._inner.load();
  }

  dispose(): void {
    ++this._inner_id;
  }

  clear(): void {
    this._inner = new Inner(this, ++this._inner_id);
  }

  get characters() {
    return this._inner.data_list_map[EntityEnum.Fighter];
  }
  get weapons() {
    return this._inner.data_list_map[EntityEnum.Weapon];
  }
  get backgrounds() {
    return this._inner.data_list_map.background;
  }
  get balls() {
    return this._inner.data_list_map[EntityEnum.Ball];
  }
  get entity() {
    return this._inner.data_list_map[EntityEnum.Entity];
  }
  get all() {
    return this._inner.data_list_map.all;
  }
  get stages(): IStageInfo[] {
    return this._inner.stages;
  }

  find(id: number | string): IEntityData | undefined {
    return this._inner.data_map.get("" + id);
  }

  find_weapon(id: string): IEntityData | undefined;
  find_weapon(predicate: IFindPredicate<IEntityData>): IEntityData | undefined;
  find_weapon(
    arg_0: string | IFindPredicate<IEntityData>,
  ): IEntityData | undefined {
    return is_str(arg_0)
      ? this.weapons.find((v) => v.id === arg_0)
      : this.weapons.find(arg_0);
  }

  find_character(id: string): IEntityData | undefined;
  find_character(
    predicate: IFindPredicate<IEntityData>,
  ): IEntityData | undefined;
  find_character(
    arg_0: string | IFindPredicate<IEntityData>,
  ): IEntityData | undefined {
    return is_str(arg_0)
      ? this.characters.find((v) => v.id === arg_0)
      : this.characters.find(arg_0);
  }

  find_background(id: string): IBgData | undefined;
  find_background(predicate: IFindPredicate<IBgData>): IBgData | undefined;
  find_background(
    arg_0: string | IFindPredicate<IBgData>,
  ): IBgData | undefined {
    return is_str(arg_0)
      ? this.backgrounds.find((v) => v.id === arg_0)
      : this.backgrounds.find(arg_0);
  }

  get_characters_of_group(group: string): IEntityData[] {
    return this.characters.filter(
      (v) => v.base.group && v.base.group.indexOf(group) >= 0,
    );
  }
  get_characters_not_in_group(group: string): IEntityData[] {
    return this.characters.filter(
      (v) => !v.base.group || v.base.group.indexOf(group) < 0,
    );
  }
}
interface IFindPredicate<T> {
  (value: T, index: number, obj: T[]): unknown;
}

