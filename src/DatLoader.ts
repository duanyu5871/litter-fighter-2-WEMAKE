import { Info } from '@fimagine/logger';
import { TData } from './G/Entity';
import { sound_mgr } from './G/loader/SoundMgr';
import { image_pool } from './G/loader/loader';
import { cook_frame } from './G/preprocess_frame';
import { IBgData, ICharacterData, IDataMap, IEntityData, IProjecttileData, IWeaponData } from './js_utils/lf2_type';
import { map, traversal } from './js_utils/traversal';

const Log = Info.Clone({ showArgs: true, showRet: true, disabled: true });

export interface IDataListMap {
  'background': IBgData[];
  'entity': IEntityData[];
  'character': ICharacterData[];
  'weapon': IWeaponData[];
  'projecttile': IProjecttileData[];
  'all': TData[]
}

const create_data_list_map = (): IDataListMap => ({
  background: [],
  entity: [],
  character: [],
  weapon: [],
  projecttile: [],
  all: []
})

export class DataMgr {
  private _data_list_map = create_data_list_map();
  private _data_map = new Map<string, TData>();

  clear() {
    this._data_list_map = (window as any)._data_list_map = create_data_list_map();
    this._data_map = (window as any)._data_map = new Map<string, TData>();
  }
  constructor() {
    this.clear();
  }
  private async _cook_data(data: TData): Promise<TData> {
    {
      let {
        weapon_broken_sound: a,
        weapon_drop_sound: b,
        weapon_hit_sound: c,
      } = (data as Partial<IWeaponData>).base ?? {}

      a && sound_mgr.load(a, require('./G/' + a));
      b && sound_mgr.load(b, require('./G/' + b));
      c && sound_mgr.load(c, require('./G/' + c));
    }


    if (!('frames' in data)) return data;
    const { frames, base: { files } } = data;
    const jobs = map(files, (_, v) => image_pool.load_by_pic_info(v, _ => require('./G/' + v.path)))
    jobs.push(image_pool.load('shadow', require('./G/shadow.png')))
    await Promise.all(jobs);
    traversal(frames, (_, frame) => cook_frame(data, frame));
    return data;
  }

  private async _add_data(index_id: string | number, raw_data: TData, data_map: Map<string, TData>) {
    const data = await this._cook_data(raw_data);
    const _index_id = '' + index_id;
    const _data_id = '' + data.id;
    if (_data_id !== _index_id) {
      console.warn(
        `[DatLoader] _add_data(), index_id not equal to data_id,`,
        `index_id: ${_index_id}, data_id: ${_data_id},`,
        `will use index_id as data key.`
      );
    }
    if (data_map.has(_index_id)) {
      console.warn(
        "[DatLoader] _add_data(), id duplicated, old data will be overwritten!",
        "old data:", data_map.get(_index_id),
        "new data:", data
      )
    }
    data_map.set(_index_id, data);
  }

  async load() {
    const data_map = new Map<string, TData>();
    const data_list_map = create_data_list_map();
    try {
      const { objects, backgrounds } = await import(`./G/data/data.json`);
      console.log('[DatLoader] loading: spark.json')
      await this._add_data("spark", await import('./G/spark.json'), data_map)
      for (const { id, file } of objects) {
        console.log('[DatLoader] loading:', file)
        await this._add_data(id, await import(`./G/${file}`), data_map);
      }
      for (const { id, file } of backgrounds) {
        console.log('[DatLoader] loading:', file)
        await this._add_data(id, await import(`./G/${file}`), data_map);
      }
      for (const [, v] of data_map) {
        const t = v.type as keyof IDataMap;
        data_list_map[t]?.push(v as any);
        data_list_map.all.push(v as any);
      }
      this._data_list_map = (window as any)._data_list_map = data_list_map;
      this._data_map = (window as any)._data_map = data_map;
    } catch (e) {
      console.warn(`[DatLoader] load(), failed. reason:`, e);
    }
  }

  get characters() { return this._data_list_map.character; }
  get weapons() { return this._data_list_map.weapon; }
  get backgrounds() { return this._data_list_map.background; }
  get projecttiles() { return this._data_list_map.projecttile; }
  get entity() { return this._data_list_map.entity; }
  get all() { return this._data_list_map.all; }

  find(id: number | string): TData | undefined {
    return this._data_map.get('' + id)
  }
}
export const dat_mgr = (window as any).dat_mgr = new DataMgr();

