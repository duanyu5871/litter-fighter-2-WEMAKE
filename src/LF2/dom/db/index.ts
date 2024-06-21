import Dexie, { EntityTable } from 'dexie'

export interface lf2_data {
  id: number;
  name: string;
  version: number;
  data: string;
  create_date: number;
}
const db = new Dexie('lf2') as Dexie & {
  tbl_lf2_data: EntityTable<lf2_data, 'id'>;
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

db.open().then(() => {

    // db.transaction('rw', db.tbl_lf2_data, () => {

    //   return db.tbl_lf2_data.put({ name: 'default', version: 1 })
    // }).then(d => {
    // }).catch(e => {
    //   debugger
    // })
})


export default db