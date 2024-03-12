import { IDataLists, IDatIndex } from '../lf2_type';
import { match_block_once } from '../match_block';
import { match_colon_value } from '../match_colon_value';
import { match_hash_end } from '../match_hash_end';
import { to_num } from '../to_num';

export function read_indexes(text: string | undefined | null): IDataLists | undefined {
  if (!text) return void 0;

  const objects = match_block_once(text, '<object>', '<object_end>')?.split(/\n|\r/).filter(v => v).map<IDatIndex>(line => {
    const item: IDatIndex = { id: '', type: '', file: '' };
    for (const [name, value] of match_colon_value(line)) {
      switch (name) {
        case 'id':
        case 'type': item[name] = to_num(value); break;
        case 'file': item[name] = value.replace(/\\/g, '/'); break;
      }
    }
    const hash = match_hash_end(line);
    if(hash) item.hash = hash
    
    return item;
  });

  const backgrounds = match_block_once(text, '<background>', '<background_end>')?.split(/\n|\r/).filter(v => v).map<IDatIndex>(line => {
    const item: IDatIndex = { id: '', type: 'bg', file: '' };
    for (const [name, value] of match_colon_value(line)) {
      switch (name) {
        case 'id': item[name] = 'bg_' + value; break;
        case 'file': item[name] = value.replace(/\\/g, '/'); break;
      }
    }
    return item;
  });
  if (!objects || !backgrounds) return void 0;
  return { objects, backgrounds }
}
