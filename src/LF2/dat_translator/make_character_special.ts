import { Defines, IEntityData } from '../defines';
import { add_entity_groups } from './add_entity_to_group';
import { make_louis_data, make_rudolf_data } from './cook_louis_data';

export function make_character_special(data: IEntityData) {
  const num_id = Number(data.id);
  if (
    (num_id >= 30 && num_id <= 39) ||
    (num_id >= 50 && num_id <= 59)
  ) {
    add_entity_groups(data.base, Defines.EntityGroup.Hidden)
  }
  if (num_id >= 1 && num_id <= 29) {
    add_entity_groups(data.base, Defines.EntityGroup.Regular)
  }
  if (data.id === '52') {
    data.base.ce = 3;
    data.base.armor = {
      fireproof: 1,
      antifreeze: 1,
      hit_sounds: ['data/002.wav.mp3'],
      type: 'times',
      toughness: 3,
    }
  } else if (data.id === '51') {
    data.base.ce = 2;
  } else if (data.id === '37') {
    data.base.armor = {
      hit_sounds: ['data/085.wav.mp3'],
      type: 'times',
      toughness: 3,
    }
  } else if (data.id === '6') {
    data.base.armor = {
      hit_sounds: ['data/085.wav.mp3'],
      type: 'times',
      toughness: 1,
    }
  } else if (
    data.id === '30' ||
    data.id === '31'
  ) {
    add_entity_groups(data.base, Defines.EntityGroup._3000)
  }
  if (data.id === '6') make_louis_data(data);
  if (data.id === '5') make_rudolf_data(data);
}
