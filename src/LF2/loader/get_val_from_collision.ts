import { CollisionVal } from '../defines/CollisionVal';
import { ICollision } from '../entity/ICollision';

export function get_val_from_collision(word: CollisionVal | string, collision: ICollision): any {
  switch (word) {
    case CollisionVal.AttackerType:
      return collision.attacker.data.type;
    case CollisionVal.VictimType:
      return collision.victim.data.type;
    case CollisionVal.ItrKind:
      return collision.itr.kind;
    case CollisionVal.ItrEffect:
      return collision.itr.effect;
    case CollisionVal.FriendlyFire:
      return collision.attacker.same_team(collision.victim) ? 1 : 0;
    case CollisionVal.SameFacing:
      return collision.attacker.facing === collision.victim.facing ? 1 : 0;
  }
  return word;
}
