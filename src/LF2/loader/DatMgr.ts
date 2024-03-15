import { Warn } from '../../Log';
import { IBallData, IBgData, ICharacterData, IDataMap, IEntityData, IGameObjData, IWeaponData } from '../../js_utils/lf2_type';
import { map, traversal } from '../../js_utils/traversal';
import LF2 from '../LF2';
import { TData } from '../entity/Entity';
import { image_pool } from './loader';
// import { make_require } from './make_require';
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
  background: [],
  entity: [],
  character: [],
  weapon: [],
  ball: [],
  all: []
})
export default class DatMgr {
  get cancelled() { return this._cancelled; }
  private _data_list_map = create_data_list_map();
  private _data_map = new Map<string, IGameObjData>();
  private _cancelled = false;
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
    this._data_list_map = (window as any)._data_list_map = create_data_list_map();
    this._data_map = (window as any)._data_map = new Map<string, IGameObjData>();
  }
  private async _cook_data(data: TData): Promise<TData> {
    {
      let {
        weapon_broken_sound: a,
        weapon_drop_sound: b,
        weapon_hit_sound: c,
      } = (data as Partial<IWeaponData>).base ?? {}

      a && this.lf2.sound_mgr.load(a, this.lf2.import(a));
      b && this.lf2.sound_mgr.load(b, this.lf2.import(b));
      c && this.lf2.sound_mgr.load(c, this.lf2.import(c));
    }

    if (!('frames' in data)) return data;
    const { frames, base: { files } } = data;
    const jobs = map(files, (_, v) => image_pool.load_by_pic_info(v, _ => this.lf2.import(v.path)))
    await Promise.all(jobs);
    traversal(frames, (_, frame) => cook_frame(this.lf2, data, frame));
    return data;
  }

  private async _add_data(index_id: string | number, raw_data: TData) {
    const data = await this._cook_data(raw_data) as IGameObjData; // fixme
    const _index_id = '' + index_id;
    const _data_id = '' + data.id;
    if (_data_id !== _index_id) {
      Warn.print('DatLoader',
        `_add_data(), index_id not equal to data_id,`,
        `index_id: ${_index_id}, data_id: ${_data_id},`,
        `will use index_id as data key.`
      );
    }
    if (this._data_map.has(_index_id)) {
      Warn.print('DatLoader',
        " _add_data(), id duplicated, old data will be overwritten!",
        "old data:", this._data_map.get(_index_id),
        "new data:", data
      )
    }
    this._data_map.set(_index_id, data);
  }
  async load() {
    this._cancelled = false;
    const { objects, backgrounds } = await this.lf2.import('data/data.json');
    if (this._cancelled) throw new Error('cancelled')
    this.lf2.world.overlay.show_loading('loading: spark.json')
    await this._add_data("spark", await this.lf2.import('data/spark.json'))
    if (this._cancelled) throw new Error('cancelled')
    for (const { id, file } of objects) {
      if (this._cancelled) throw new Error('cancelled')
      this.lf2.world.overlay.show_loading(`loading object: ${file}`)
      await this._add_data(id, await this.lf2.import(file));
    }
    for (const { id, file } of backgrounds) {
      if (this._cancelled) throw new Error('cancelled')
      this.lf2.world.overlay.show_loading(`loading background: ${file}`)
      await this._add_data(id, await this.lf2.import(file));
    }
    for (const [, v] of this._data_map) {
      if (this._cancelled) throw new Error('cancelled')
      const t = v.type as keyof IDataMap;
      this._data_list_map[t]?.push(v as any);
      this._data_list_map.all.push(v as any);
    }
    this.lf2.world.overlay.show_loading('')
  }
  cancel() {
    this._cancelled = true;
  }
  get characters() { return this._data_list_map.character; }
  get weapons() { return this._data_list_map.weapon; }
  get backgrounds() { return this._data_list_map.background; }
  get balls() { return this._data_list_map.ball; }
  get entity() { return this._data_list_map.entity; }
  get all() { return this._data_list_map.all; }

  find(id: number | string): IGameObjData | undefined {
    return this._data_map.get('' + id)
  }
}