import { Defines, ItrKind } from "../defines";
import { BdyKind } from "../defines/BdyKind";
import { ICollision } from "../defines/ICollision";

export class CollisionHandler {
  protected pair_map: Map<string, (collision: ICollision) => void> = new Map();
  add(itr_kind: ItrKind | ItrKind[], bdy_kind: BdyKind | BdyKind[], fn: (collision: ICollision) => void) {
    const itr_kind_list = Array.isArray(itr_kind) ? itr_kind : [itr_kind];
    const bdy_kind_list = Array.isArray(bdy_kind) ? bdy_kind : [bdy_kind];
    for (const itr_kind of itr_kind_list) {
      for (const bdy_kind of bdy_kind_list) {
        this.pair_map.set('' + itr_kind + '_' + bdy_kind, fn);
      }
    }
  }
  get(itr_kind: ItrKind, bdy_kind: BdyKind) {
    if (itr_kind === void 0) { console.warn('[CollisionHandler] itr.kind got', itr_kind); debugger; }
    if (bdy_kind === void 0) { console.warn('[CollisionHandler] bdy.kind got', bdy_kind); debugger; }
    return this.pair_map.get('' + itr_kind + '_' + bdy_kind);
  }
  handle(collision: ICollision) {
    this.get(collision.itr.kind!, collision.bdy.kind!)?.(collision);
  }

}
export const collision_handler = new CollisionHandler();
collision_handler.add(ItrKind.Catch, [BdyKind.Normal, BdyKind.Defend], (c) => {
  if (c.attacker.dizzy_catch_test(c.victim))
    c.victim.start_caught(c.attacker, c.itr)
})
collision_handler.add(ItrKind.ForceCatch, [BdyKind.Normal, BdyKind.Defend], (c) => {
  c.victim.start_caught(c.attacker, c.itr)
})
collision_handler.add(ItrKind.Wind, [BdyKind.Normal, BdyKind.Defend], (c) => {
  const { attacker, victim } = c;
  victim.merge_velocities();
  let { x, y, z } = victim.velocities[0];
  const dz = Math.round(victim.position.z - attacker.position.z);
  const dx = Math.round(victim.position.x - attacker.position.x);
  let d = dx > 0 ? -1 : 1
  let l = dz > 0 ? -1 : dz < 0 ? 1 : 0
  y += y < 4 ? 1 : -1;
  x += d * 0.5;
  z += l * 0.5;
  victim.velocities[0].set(x, y, z)
})
collision_handler.add(ItrKind.Freeze, [BdyKind.Normal, BdyKind.Defend], (c) => {
  const { itr, victim, attacker } = c
  victim.play_sound(["data/065.wav.mp3"]);
  victim.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
  const is_fall = victim.fall_value <= 0 || (
    victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY
    && (
      Defines.State.Caught === victim.frame.state ||
      victim.velocities[0].y > 0 ||
      victim.position.y > 0
    )
  )
  if (is_fall && itr.dvy)
    victim.velocities[0].y = itr.dvy ?? 2;
  if (itr.dvz)
    victim.velocities[0].z = itr.dvz;
  victim.velocities[0].x = (itr.dvx || 2) * attacker.facing;
  victim.next_frame = { id: victim.data.indexes?.ice };
})