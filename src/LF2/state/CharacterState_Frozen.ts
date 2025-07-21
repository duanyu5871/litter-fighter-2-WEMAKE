import { BuiltIn_OID, IFrameInfo, IOpointInfo } from "../defines";
import type { Entity } from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";

function make_ice_piece(victim: Entity, id: string): IOpointInfo {
  return {
    kind: 0,
    x: victim.frame.centerx,
    y: victim.frame.centery / 2,
    oid: BuiltIn_OID.BrokenWeapon,
    action: { id, facing: victim.lf2.random_get([-1, 1]) },
    dvx: victim.lf2.random_in(-2, 2),
    dvz: victim.lf2.random_in(-2, 2),
    dvy: victim.lf2.random_in(0, 5),
  };
}

export default class CharacterState_Frozen extends CharacterState_Base {
  override leave(e: Entity, next_frame: IFrameInfo): void {
    e.play_sound(["data/066.wav.mp3"]);
    if (e.data.indexes?.ice !== next_frame.id) {
      e.apply_opoints([
        make_ice_piece(e, "130"),
        make_ice_piece(e, "130"),
        make_ice_piece(e, "130"),
        make_ice_piece(e, "120"),
        make_ice_piece(e, "120"),
        make_ice_piece(e, "125"),
        make_ice_piece(e, "125"),
        make_ice_piece(e, "125"),
        make_ice_piece(e, "125"),
        make_ice_piece(e, "135"),
        make_ice_piece(e, "135"),
        make_ice_piece(e, "135"),
        make_ice_piece(e, "135"),
        make_ice_piece(e, "135"),
        make_ice_piece(e, "135"),
        make_ice_piece(e, "135"),
      ]);
    }
    super.leave?.(e, next_frame);
  }
  override on_landing(e: Entity): void {
    const {
      data: { indexes },
    } = e;
    const { y: vy } = e.velocity;
    if (vy <= e.world.cha_bc_tst_spd * 2) {
      e.enter_frame({ id: indexes?.bouncing?.[-1][0] });
      e.velocity_0.y = e.world.cha_bc_spd;
    }
  }
}
