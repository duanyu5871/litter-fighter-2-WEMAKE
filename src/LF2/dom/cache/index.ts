import Dexie, { EntityTable } from 'dexie';
import { ICacheData } from '../../ditto/cache/ICacheData';
import { ICache } from '../../ditto/cache';

const db = new Dexie('lf2') as Dexie & {
  tbl_lf2_data: EntityTable<ICacheData, 'id'>;
}
db.version(1).stores({
  tbl_lf2_data: '++id, name, version'
})
db.version(2).stores({
  tbl_lf2_data: '++id, name, version, data'
}).upgrade(trans => {
  return trans.table('tbl_lf2_data').toCollection().modify(lf2_data => {
    lf2_data.data = ''
  });
})

db.version(3).stores({
  tbl_lf2_data: '++id, name, version, data, create_date'
}).upgrade(trans => {
  return trans.table('tbl_lf2_data').toCollection().modify(lf2_data => {
    lf2_data.create_date = Date.now()
  });
})

export const __Cache: ICache = {
  async get(name: string): Promise<ICacheData | undefined> {
    return db.open().catch(_ => void 0).then(() => db.tbl_lf2_data.where('name').equals(name).first())
  },
  async put(name: string, data: string): Promise<number | void> {
    return db.open().catch(_ => void 0).then(() => db.tbl_lf2_data.put({
      name, version: 0, data, create_date: Date.now()
    }))
  }
}