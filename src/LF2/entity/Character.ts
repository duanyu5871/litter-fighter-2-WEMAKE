import { type World } from '../World';
import type { ICharacterData, IEntityInfo, IFrameInfo } from '../defines';
import { Defines } from '../defines/defines';
import { CHARACTER_STATES } from '../state/character';
import Entity from './Entity';
import { Factory } from './Factory';

export default class Character extends Entity<IFrameInfo, IEntityInfo, ICharacterData> {
  static override readonly TAG: string = 'Character';
  readonly is_character = true;
  constructor(world: World, data: ICharacterData) {
    super(world, data, CHARACTER_STATES);
    this.name = Character.name + ':' + data.base.name;
    this.enter_frame({ id: Defines.FrameId.Auto });
  }
}
Factory.inst.set_entity_creator('character', (...args) => new Character(...args));