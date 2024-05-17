import { IDataLists } from "../defines/IDataLists";
import { IDatIndex } from "../defines/IDatIndex";
import { match_block_once } from '../utils/string_parser/match_block';
import { match_colon_value } from '../utils/string_parser/match_colon_value';
import { match_hash_end } from '../utils/string_parser/match_hash_end';
import { to_num } from '../utils/type_cast/to_num';

export function read_indexes(text: string | undefined | null): IDataLists | undefined {
  if (!text) return void 0;

  const objects = match_block_once(text, '<object>', '<object_end>')?.split(/\n|\r/).filter(v => v).map<IDatIndex>(line => {
    const item: IDatIndex = { id: '', type: '', file: '' };
    for (const [name, value] of match_colon_value(line)) {
      switch (name) {
        case 'id': item[name] = value; break;
        case 'type': item[name] = to_num(value) ?? value; break;
        case 'file': item[name] = value.replace(/\\/g, '/'); break;
      }
    }
    const hash = match_hash_end(line);
    if (hash) item.hash = hash;
    if (item.id === '217') item.hash = 'louis_limbs_armour';
    if (item.id === '216') item.hash = 'louis_body_armour';
    if (item.id === '124') item.hash = 'boomerang';
    if (item.id === '201') item.hash = 'henry_arrow';
    if (item.id === '202') item.hash = 'rudolf_weapon';
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
