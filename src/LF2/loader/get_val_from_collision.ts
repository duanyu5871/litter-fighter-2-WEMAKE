import { IValGetter, IValGetterGetter } from '../defines/IExpression';
import { CollisionVal } from '../defines/CollisionVal';
import { ICollision } from '../defines/ICollision';

const map: Record<CollisionVal, IValGetter<ICollision>> = {
  [CollisionVal.AttackerType]: (collision: ICollision) => collision.attacker.data.type,
  [CollisionVal.VictimType]: (collision: ICollision) => collision.victim.data.type,
  [CollisionVal.ItrKind]: (collision: ICollision) => collision.itr.kind,
  [CollisionVal.ItrEffect]: (collision: ICollision) => collision.itr.effect,
  [CollisionVal.SameTeam]: (collision: ICollision) => collision.attacker.same_team(collision.victim) ? 1 : 0,
  [CollisionVal.SameFacing]: (collision: ICollision) => collision.attacker.facing === collision.victim.facing ? 1 : 0,
  [CollisionVal.AttackerState]: (collision: ICollision) => collision.aframe.state,
  [CollisionVal.VictimState]: (collision: ICollision) => collision.bframe.state,
  [CollisionVal.AttackerHasHolder]: (collision: ICollision) => collision.attacker.holder ? 1 : 0,
  [CollisionVal.VictimHasHolder]: (collision: ICollision) => collision.victim.holder ? 1 : 0,
  [CollisionVal.AttackerHasHolding]: (collision: ICollision) => collision.attacker.holding ? 1 : 0,
  [CollisionVal.VictimHasHolding]: (collision: ICollision) => collision.victim.holding ? 1 : 0,
  [CollisionVal.AttackerOID]: (collision: ICollision) => collision.attacker.data.id,
  [CollisionVal.VictimOID]: (collision: ICollision) => collision.victim.data.id,
  [CollisionVal.BdyKind]: (collision: ICollision) => collision.bdy.kind,
  [CollisionVal.VictimFrameId]: (collision: ICollision) => collision.bframe.id,
  [CollisionVal.VictimFrameIndex_ICE]: (collision: ICollision) => collision.victim.data.indexes?.ice,
  [CollisionVal.ItrFall]: (collision: ICollision) => collision.itr.fall,
  [CollisionVal.AttackerThrew]: (collision: ICollision) => collision.attacker.throwinjury !== void 0 ? 1 : 0,
  [CollisionVal.VictimThrew]: (collision: ICollision) => collision.victim.throwinjury !== void 0 ? 1 : 0,
}
export const get_val_geter_from_collision: IValGetterGetter<ICollision> = (word: string): IValGetter<ICollision> | undefined => {
  return (map as any)[word]
}