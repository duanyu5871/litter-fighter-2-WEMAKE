import { BuiltIn_OID, Defines, FacingFlag, IOpointInfo } from "../defines";
import { floor } from "../utils/math/base";
import { is_num, not_zero_num } from "../utils/type_check";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take } from "./take";

export default function cook_opoint(opoint: IOpointInfo) {
  const action = take(opoint, "action");
  opoint.oid = "" + take(opoint, "oid");

  if (is_num(action)) {
    const act = get_next_frame_by_raw_id(action);
    const facing = take(opoint, "facing");
    if (is_num(facing)) {
      act.facing =
        facing % 2 ? FacingFlag.Backward : FacingFlag.None;
      if (facing >= 2 && facing <= 19) {
        act.facing = FacingFlag.Right;
      } else if (facing >= 20) {
        opoint.multi = floor(facing / 10);
      }
    } else {
      act.facing = FacingFlag.None;
    }
    opoint.action = act;
  }

  const dvx = take(opoint, "dvx");
  if (not_zero_num(dvx)) opoint.dvx = dvx * 0.5;
  else opoint.dvx = 0;

  const dvz = take(opoint, "dvz");
  if (not_zero_num(dvz)) opoint.dvz = dvz * 0.5;

  const dvy = take(opoint, "dvy");
  if (not_zero_num(dvy)) opoint.dvy = dvy * -0.5;

  switch (opoint.oid) {
    case BuiltIn_OID.HenryWind:
    case BuiltIn_OID.FirzenBall:
    case BuiltIn_OID.Bat:
    case BuiltIn_OID.BatChase:
    case BuiltIn_OID.BatBall:
    case BuiltIn_OID.JanChase:
    case BuiltIn_OID.JanChaseh:
      opoint.speedz = opoint.dvx = opoint.dvy = opoint.dvz = 0;
      break;
    case BuiltIn_OID.FirenFlame:
      opoint.speedz = Defines.DEFAULT_FIREN_FLAME_SPEED_Z;
      break;
    default:
      opoint.speedz = Defines.DEFAULT_OPOINT_SPEED_Z;
      // throw new Error('opoint: '+JSON.stringify(opoint))
      break;
  }
}
