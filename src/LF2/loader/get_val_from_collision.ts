import { CollisionVal } from '../defines/CollisionVal';
import { ICollision } from '../entity/ICollision';

export function get_val_from_collision(word: CollisionVal | string, collision: ICollision): any {
  switch (word as CollisionVal) {
    case CollisionVal.AttackerType:
      return collision.attacker.data.type;
    case CollisionVal.VictimType:
      return collision.victim.data.type;
    case CollisionVal.ItrKind:
      return collision.itr.kind;
    case CollisionVal.ItrEffect:
      return collision.itr.effect;
    case CollisionVal.SameTeam:
    case CollisionVal.FriendlyFire:
      return collision.attacker.same_team(collision.victim) ? 1 : 0;
    case CollisionVal.SameFacing:
      return collision.attacker.facing === collision.victim.facing ? 1 : 0;
    case CollisionVal.AttackerState:
      return collision.aframe.state;
    case CollisionVal.VictimState:
      return collision.bframe.state;
    case CollisionVal.AttackerHasHolder:
      return collision.attacker.holder ? 1 : 0
    case CollisionVal.VictimHasHolder:
      return collision.victim.holder ? 1 : 0
    case CollisionVal.AttackerHasHolding:
      return collision.attacker.holding ? 1 : 0
    case CollisionVal.VictimHasHolding:
      return collision.victim.holding ? 1 : 0
    case CollisionVal.AttackerOId:
      return collision.attacker.data.id
    case CollisionVal.VictimOID:
      return collision.victim.data.id
  }
  return word;
}
