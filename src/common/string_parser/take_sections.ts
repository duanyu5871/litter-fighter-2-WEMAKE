import { match_colon_value } from './match_colon_value';
import { take_blocks } from './take_blocks';
import { to_num } from '../../LF2/utils/type_cast/to_num';

export default function take_sections<T = any>(text: string, start: string, end: string, f?: (remains: string) => void): T[] {
  return take_blocks(text, start, end, f).map<T>((content_str) => {
    const item: any = {};
    for (const [name, value] of match_colon_value(content_str)) {
      item[name] = to_num(value) ?? value;
    }
    return item;
  });
}
