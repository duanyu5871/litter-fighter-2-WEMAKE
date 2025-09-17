import { BdyKind, Defines, FacingFlag, IFrameInfo, ItrKind, OpointKind, StateEnum } from "../defines";
import { AllyFlag } from "../defines/AllyFlag";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { ensure } from "../utils";
import { foreach } from "../utils/container_help/foreach";
import { CondMaker } from "./CondMaker";

export function make_frame_state(frame: IFrameInfo) {
  switch (frame.state) {
    case StateEnum.Ball_3005:
      frame.no_shadow = 1;
      break;
    case StateEnum.HeavyWeapon_OnHand:
      frame.no_shadow = 1;
      frame.gravity_enabled = false;
      break;
    case StateEnum.Weapon_OnHand:
      frame.no_shadow = 1;
      frame.gravity_enabled = false;
      break;
    case StateEnum.Burning: {
      foreach(frame.itr, itr => {
        itr.ally_flags = AllyFlag.Both;
      })
      break;
    }
    case StateEnum.OLD_LouisCastOff: {
      frame.state = StateEnum.Attacking;
      frame.opoint = ensure(frame.opoint,
        {
          kind: OpointKind.Normal,
          x: 39,
          y: 79,
          oid: "218",
          dvy: 5,
          action: { id: "auto" },
          speedz: 0
        },
        {
          kind: OpointKind.Normal,
          x: 39,
          y: 79,
          oid: "217",
          dvy: 4,
          dvx: -5,
          dvz: 4,
          action: { id: "auto", facing: FacingFlag.Backward },
          speedz: 0
        },
        {
          kind: OpointKind.Normal,
          x: 39,
          y: 79,
          oid: "217",
          dvy: 4,
          dvx: -5,
          dvz: -4,
          action: { id: "auto", facing: FacingFlag.Backward },
          speedz: 0
        },
        {
          kind: OpointKind.Normal,
          x: 39,
          y: 79,
          oid: "217",
          dvy: 4,
          dvx: -5,
          dvz: 4,
          action: { id: "auto" },
          speedz: 0
        },
        {
          kind: OpointKind.Normal,
          x: 39,
          y: 79,
          oid: "217",
          dvy: 4,
          dvx: -5,
          dvz: -4,
          action: { id: "auto" },
          speedz: 0
        }
      );
      break;
    }
    case StateEnum.Falling: {
      foreach(frame.bdy, bdy => {
        if (bdy.kind !== BdyKind.Normal) return;
        bdy.test = new CondMaker<C_Val>()
          .add(
            C_Val.ItrFall,
            ">=",
            Defines.DEFAULT_FALL_VALUE_CRITICAL
          )
          .or(C_Val.ItrKind, "==", ItrKind.MagicFlute)
          .or(C_Val.ItrKind, "==", ItrKind.MagicFlute2)
          .done();
      })
      break;
    }
    case StateEnum.Weapon_OnGround: {
      frame.friction_x = Defines.LAND_FRICTION_X;
      frame.friction_z = Defines.LAND_FRICTION_Z;
      frame.friction_factor = Defines.LAND_FRICTION_FACTOR;
      break;
    }
    case StateEnum.Lying:
      frame.friction_x = Defines.LAND_FRICTION_X;
      frame.friction_z = Defines.LAND_FRICTION_Z;
      frame.friction_factor = Defines.LAND_FRICTION_FACTOR;
      break;
    case StateEnum.Frozen:
      frame.friction_x = Defines.LAND_FRICTION_X;
      frame.friction_z = Defines.LAND_FRICTION_Z;
      frame.friction_factor = Defines.LAND_FRICTION_FACTOR;
      foreach(frame.bdy, bdy => bdy.ally_flags = AllyFlag.Both)
      break;
  }
}
