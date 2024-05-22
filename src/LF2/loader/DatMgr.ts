import { Log } from '../../Log';
import LF2 from '../LF2';
import { IBallData, IBgData, ICharacterData, IDataMap, IEntityData, IGameObjData, IStageInfo, IWeaponData } from '../defines';
import { Defines } from '../defines/defines';
import { TData } from '../entity/Entity';
import { traversal } from '../utils/container_help/traversal';
import { is_str, not_blank_str } from '../utils/type_check';
import { cook_frame } from './preprocess_frame';

export interface IDataListMap {
  'background': IBgData[];
  'entity': IEntityData[];
  'character': ICharacterData[];
  'weapon': IWeaponData[];
  'ball': IBallData[];
  'all': TData[]
}

const create_data_list_map = (): IDataListMap => ({
  background: [Defines.VOID_BG],
  entity: [],
  character: [],
  weapon: [],
  ball: [],
  all: []
})

class Inner {
  readonly mgr: DatMgr;
  readonly id: number;
  get cancelled(): boolean { return this.mgr.inner_id !== this.id }
  data_list_map = create_data_list_map();
  data_map = new Map<string, IGameObjData>();
  stages: IStageInfo[] = [Defines.VOID_STAGE]
  get lf2() { return this.mgr.lf2 }

  constructor(mgr: DatMgr, id: number) {
    this.mgr = mgr;
    this.id = id;
  }

  private async _cook_data(data: TData): Promise<TData> {
    const jobs: Promise<unknown>[] = [];
    const { images, sounds } = this.lf2;
    if (Defines.is_weapon_data(data)) {
      const {
        weapon_broken_sound: a,
        weapon_drop_sound: b,
        weapon_hit_sound: c,
      } = data.base
      not_blank_str(a) && !sounds.has(a) && jobs.push(sounds.load(a, a));
      not_blank_str(b) && !sounds.has(b) && jobs.push(sounds.load(b, b));
      not_blank_str(c) && !sounds.has(c) && jobs.push(sounds.load(c, c));
    }
    if (Defines.is_character_data(data)) {
      const { small, head } = data.base;
      not_blank_str(small) && jobs.push(images.load_img(small, small));
      not_blank_str(head) && jobs.push(images.load_img(head, head));
    }
    if (Defines.is_bg_data(data)) {
      const { layers, base: { shadow } } = data;
      not_blank_str(shadow) && jobs.push(images.load_img(shadow, shadow))
      for (const { file } of layers) {
        not_blank_str(file) && jobs.push(images.load_img(file, file))
      }
    }
    if (Defines.is_game_obj_data(data)) {
      const { frames, base: { files } } = data;
      traversal(files, (_, v) => {
        jobs.push(images.load_by_e_pic_info(v))
      })
      if (jobs.length) await Promise.all(jobs);
      if (frames) {
        traversal(frames, (_, frame) => cook_frame(this.lf2, data, frame));
      }
    }
    return data;
  }

  private async _add_data(index_id: string | number, raw_data: TData) {
    const data = await this._cook_data(raw_data) as IGameObjData; // fixme
    const _index_id = '' + index_id;
    const _data_id = '' + data.id;
    if (_data_id === 'spark') debugger
    if (_data_id !== _index_id) {
      Log.print('DatLoader',
        `_add_data(), index_id not equal to data_id,`,
        `index_id: ${_index_id}, data_id: ${_data_id},`,
        `will use index_id as data key.`
      );
    }
    if (this.data_map.has(_index_id)) {
      Log.print('DatLoader',
        " _add_data(), id duplicated, old data will be overwritten!",
        "old data:", this.data_map.get(_index_id),
        "new data:", data
      )
    }
    this.data_map.set(_index_id, data);
  }

  async load() {

    for (const k of Object.keys(Defines.BuiltIn.Imgs)) {
      const src = (Defines.BuiltIn.Imgs as any)[k];
      if (!not_blank_str(src)) continue;
      this.lf2.on_loading_content(`${src}`, 0);
      await this.lf2.images.load_img(src, src)
    }

    for (const k of Object.keys(Defines.BuiltIn.Dats)) {
      const src = (Defines.BuiltIn.Dats as any)[k];
      if (!not_blank_str(src)) continue;
      this.lf2.on_loading_content(`${src}`, 0);
      await this._add_data(src, await this.lf2.import_json(src))
    }


    const { objects, backgrounds } = await this.lf2.import_json('data/data.json');
    if (this.cancelled) throw new Error('cancelled')

    if (this.cancelled) throw new Error('cancelled')
    for (const { id, file } of objects) {
      if (this.cancelled) throw new Error('cancelled')

      this.lf2.on_loading_content(`${file}`, 0);
      await this._add_data(id, await this.lf2.import_json(file));
    }
    for (const { id, file } of backgrounds) {
      if (this.cancelled) throw new Error('cancelled')
      this.lf2.on_loading_content(`${file}`, 0);
      await this._add_data(id, await this.lf2.import_json(file));
    }
    for (const [, v] of this.data_map) {
      if (this.cancelled) throw new Error('cancelled')
      const t = v.type as keyof IDataMap;
      this.data_list_map[t]?.push(v as any);
      this.data_list_map.all.push(v as any);
    }

    const stage_file = 'data/stage.json';
    this.lf2.on_loading_content(`${stage_file}`, 0);
    this.stages = [Defines.VOID_STAGE, ...await this.lf2.import_json('data/stage.json')];
    this.lf2.on_loading_content(`${stage_file}`, 100);
  }
}

export default class DatMgr {
  find_group(group_name: string) {
    return {
      characters: this.characters.filter(v => v.base.group && v.base.group.indexOf(group_name) >= 0),
      weapons: this.weapons.filter(v => v.base.group && v.base.group.indexOf(group_name) >= 0),
      entity: this.entity.filter(v => v.base.group && v.base.group.indexOf(group_name) >= 0),
    }
  }
  private _inner_id: number = 0;
  private _inner = new Inner(this, ++this._inner_id);
  get inner_id(): number { return this._inner_id; }
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

  get characters() { return this._inner.data_list_map.character; }
  get weapons() { return this._inner.data_list_map.weapon; }
  get backgrounds() { return this._inner.data_list_map.background; }
  get balls() { return this._inner.data_list_map.ball; }
  get entity() { return this._inner.data_list_map.entity; }
  get all() { return this._inner.data_list_map.all; }
  get stages(): IStageInfo[] { return this._inner.stages }

  find(id: number | string): IGameObjData | undefined {
    return this._inner.data_map.get('' + id)
  }

  find_weapon(id: string): IWeaponData | undefined
  find_weapon(predicate: IFindPredicate<IWeaponData>): IWeaponData | undefined;
  find_weapon(arg_0: string | IFindPredicate<IWeaponData>): IWeaponData | undefined {
    return is_str(arg_0) ? this.weapons.find(v => v.id === arg_0) : this.weapons.find(arg_0)
  }

  find_character(id: string): ICharacterData | undefined
  find_character(predicate: IFindPredicate<ICharacterData>): ICharacterData | undefined;
  find_character(arg_0: string | IFindPredicate<ICharacterData>): ICharacterData | undefined {
    return is_str(arg_0) ? this.characters.find(v => v.id === arg_0) : this.characters.find(arg_0)
  }

  find_background(id: string): IBgData | undefined;
  find_background(predicate: IFindPredicate<IBgData>): IBgData | undefined;
  find_background(arg_0: string | IFindPredicate<IBgData>): IBgData | undefined {
    return is_str(arg_0) ? this.backgrounds.find(v => v.id === arg_0) : this.backgrounds.find(arg_0)
  }
}
interface IFindPredicate<T> {
  (value: T, index: number, obj: T[]): unknown
}