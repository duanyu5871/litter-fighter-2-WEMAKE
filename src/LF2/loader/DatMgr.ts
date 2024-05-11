import { Log } from '../../Log';
import { is_str } from '../../common/is_str';
import { IBallData, IBgData, ICharacterData, IDataMap, IEntityData, IGameObjData, IWeaponData } from '../../common/lf2_type';
import { Defines } from '../../common/lf2_type/defines';
import { map, traversal } from '../../common/traversal';
import LF2 from '../LF2';
import { TData } from '../entity/Entity';
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

  get lf2() { return this.mgr.lf2 }

  constructor(mgr: DatMgr, id: number) {
    this.mgr = mgr;
    this.id = id;
  }

  private async _cook_data(data: TData): Promise<TData> {
    {
      let {
        weapon_broken_sound: a,
        weapon_drop_sound: b,
        weapon_hit_sound: c,
      } = (data as Partial<IWeaponData>).base ?? {}
      const mgr = this.lf2.sound_mgr;
      a && !mgr.has(a) && mgr.preload(a, a);
      b && !mgr.has(b) && mgr.preload(b, b);
      c && !mgr.has(c) && mgr.preload(c, c);
    }

    if (!('frames' in data)) return data;
    const { frames, base: { files } } = data;
    const jobs = map(files, (_, v) => this.lf2.img_mgr.load_by_e_pic_info(v))
    await Promise.all(jobs);
    traversal(frames, (_, frame) => cook_frame(this.lf2, data, frame));
    return data;
  }

  private async _add_data(index_id: string | number, raw_data: TData) {
    const data = await this._cook_data(raw_data) as IGameObjData; // fixme
    const _index_id = '' + index_id;
    const _data_id = '' + data.id;
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
    const { objects, backgrounds } = await this.lf2.import_json('data/data.json');
    if (this.cancelled) throw new Error('cancelled')
    this.lf2.on_loading_content(`loading: spark.json`, 0);
    await this._add_data("spark", await this.lf2.import_json('data/spark.json'))
    this.lf2.on_loading_content(`loading: spark.json`, 100);

    if (this.cancelled) throw new Error('cancelled')
    for (const { id, file } of objects) {
      if (this.cancelled) throw new Error('cancelled')

      this.lf2.on_loading_content(`loading object: ${file}`, 0);
      await this._add_data(id, await this.lf2.import_json(file));
      this.lf2.on_loading_content(`loading object: ${file}`, 100);
    }
    for (const { id, file } of backgrounds) {
      if (this.cancelled) throw new Error('cancelled')
      this.lf2.on_loading_content(`loading background: ${file}`, 0);
      await this._add_data(id, await this.lf2.import_json(file));
      this.lf2.on_loading_content(`loading background: ${file}`, 100);
    }
    for (const [, v] of this.data_map) {
      if (this.cancelled) throw new Error('cancelled')
      const t = v.type as keyof IDataMap;
      this.data_list_map[t]?.push(v as any);
      this.data_list_map.all.push(v as any);
    }
  }
}

export default class DatMgr {
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

  cancel(): void {
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