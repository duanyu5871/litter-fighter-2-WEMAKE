import { IValGetter, IValGetterGetter } from '../base/Expression';
import { CollisionVal } from '../defines/CollisionVal';
import { ICollision } from '../entity/ICollision';

export const get_val_geter_from_collision: IValGetterGetter<ICollision> = (word: string): IValGetter<ICollision> | undefined => {
  switch (word as CollisionVal) {
    case CollisionVal.AttackerType:
      return (collision: ICollision) => collision.attacker.data.type;
    case CollisionVal.VictimType:
      return (collision: ICollision) => collision.victim.data.type;
    case CollisionVal.ItrKind:
      return (collision: ICollision) => collision.itr.kind;
    case CollisionVal.ItrEffect:
      return (collision: ICollision) => collision.itr.effect;
    case CollisionVal.SameTeam:
    case CollisionVal.FriendlyFire:
      return (collision: ICollision) => collision.attacker.same_team(collision.victim) ? 1 : 0;
    case CollisionVal.SameFacing:
      return (collision: ICollision) => collision.attacker.facing === collision.victim.facing ? 1 : 0;
    case CollisionVal.AttackerState:
      return (collision: ICollision) => collision.aframe.state;
    case CollisionVal.VictimState:
      return (collision: ICollision) => collision.bframe.state;
    case CollisionVal.AttackerHasHolder:
      return (collision: ICollision) => collision.attacker.holder ? 1 : 0
    case CollisionVal.VictimHasHolder:
      return (collision: ICollision) => collision.victim.holder ? 1 : 0
    case CollisionVal.AttackerHasHolding:
      return (collision: ICollision) => collision.attacker.holding ? 1 : 0
    case CollisionVal.VictimHasHolding:
      return (collision: ICollision) => collision.victim.holding ? 1 : 0
    case CollisionVal.AttackerOID:
      return (collision: ICollision) => collision.attacker.data.id
    case CollisionVal.VictimOID:
      return (collision: ICollision) => collision.victim.data.id
  }
  return void 0;
}