import type IEntityCallbacks from './IEntityCallbacks';
import type Character from './Character';
export default interface ICharacterCallbacks<E extends Character = Character> extends IEntityCallbacks<E> {
  on_dead?(e: E): void;
}
