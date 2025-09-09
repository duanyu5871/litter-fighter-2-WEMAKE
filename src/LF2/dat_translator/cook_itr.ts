import { BuiltIn_OID, FacingFlag, IItrInfo, ItrEffect, ItrKind, StateEnum } from "../defines";
import { BdyKind } from "../defines/BdyKind";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { Defines } from "../defines/defines";
import { EntityEnum } from "../defines/EntityEnum";
import { is_num, is_positive, not_zero_num } from "../utils/type_check";
import { CondMaker } from "./CondMaker";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take } from "./take";
import { take_not_zero_num } from "./take_not_zero_num";
import { AllyFlag } from "../defines/AllyFlag";
import { ensure, max } from "../utils";
import { fixed_float } from "./fixed_float";
import { take_positive_num } from "./take_positive_num";

export function cook_itr(itr?: Partial<IItrInfo>) {

  if (!itr) return;
  itr.ally_flags = AllyFlag.Enemy;

  itr.vrest = take_positive_num(itr, "vrest", n => max(2, 2 * n - Defines.DEFAULT_ITR_SHAKING - 4))
  itr.arest = take_positive_num(itr, "arest", n => max(2, 2 * n - Defines.DEFAULT_ITR_MOTIONLESS - 4))

  const src_dvx = itr.dvx
  itr.dvx = take_not_zero_num(itr, "dvx", n => fixed_float(n * 0.5, 4));
  itr.dvz = take_not_zero_num(itr, "dvz", n => fixed_float(n * 0.5, 4));
  itr.dvy = take_not_zero_num(itr, "dvy", n => fixed_float(n * -0.59, 4));
  itr.fall = take_not_zero_num(itr, "fall", n => n * 2);
  itr.bdefend = take_not_zero_num(itr, "bdefend", n => n * 2);


  const zwidth = take_not_zero_num(itr, "zwidth") ?? Defines.DAFUALT_QUBE_LENGTH / 2;
  itr.l = 2 * zwidth;
  itr.z = -zwidth;

  const kind_name = (ItrKind as any)[itr.kind!];
  if (kind_name) itr.kind_name = `ItrKind.${kind_name}`;

  if (itr.effect !== void 0) {
    const effect_name = ItrEffect[itr.effect as ItrEffect];
    if (effect_name) itr.effect_name = `ItrEffect.${effect_name}`;
  }

  switch (itr.kind) {
    case ItrKind.Normal: {
      const cond_maker = new CondMaker<C_Val>()
      // .wrap((c) => c
      //   .add(C_Val.VictimState, "!=", StateEnum.Weapon_OnGround)
      //   .or(C_Val.AttackerType, "!=", EntityEnum.Character),
      // );
      switch (itr.effect) {
        case ItrEffect.Fire:
          cond_maker.and((c) => c
            .add(C_Val.VictimState, "!=", StateEnum.Burning)
            .or(C_Val.AttackerState, "!=", StateEnum.BurnRun)
          );
          break;
        case ItrEffect.MFire1:
          cond_maker
            .and(C_Val.VictimType, "!=", EntityEnum.Fighter)
            .or((c) => c
              .add(C_Val.VictimState, "!=", StateEnum.BurnRun)
              .and(C_Val.VictimState, "!=", StateEnum.Burning)
            );
          break;
        case ItrEffect.MFire2:
          cond_maker.and((c) => c
            .add(C_Val.VictimState, "!=", StateEnum.BurnRun)
            .and(C_Val.VictimState, "!=", StateEnum.Burning),
          );
          break;
        case ItrEffect.Through:
          cond_maker.and(C_Val.VictimType, "!=", EntityEnum.Fighter);
          break;
        case ItrEffect.Ice2:
          cond_maker.and((c) =>
            c
              .add(C_Val.VictimState, "!=", StateEnum.Frozen)
              .and(C_Val.VictimFrameId, "!=", C_Val.VictimFrameIndex_ICE),
          );
          break;
      }
      itr.test = cond_maker.done();
      break;
    }
    case ItrKind.Pick: {
      itr.ally_flags = AllyFlag.Both;
      itr.motionless = 0;
      itr.shaking = 0;
      itr.test = new CondMaker<C_Val>()
        .add(C_Val.AttackerHasHolder, "==", 0)
        .and(C_Val.VictimHasHolder, "==", 0)
        .and()
        .one_of(
          C_Val.VictimState,
          StateEnum.Weapon_OnGround,
          StateEnum.HeavyWeapon_OnGround,
        )
        .done();
      break;
    }
    case ItrKind.PickSecretly: {
      itr.ally_flags = AllyFlag.Both;
      itr.motionless = 0;
      itr.shaking = 0;
      itr.test = new CondMaker<C_Val>()
        .add(C_Val.AttackerHasHolder, "==", 0)
        .and(C_Val.VictimHasHolder, "==", 0)
        .and(C_Val.VictimState, "==", StateEnum.Weapon_OnGround)
        .done();
      break;
    }
    case ItrKind.SuperPunchMe: {
      itr.motionless = 0;
      itr.shaking = 0;
      itr.test = new CondMaker<C_Val>()
        .add(C_Val.VictimType, "==", EntityEnum.Fighter)
        .done();
      break;
    }
    case ItrKind.MagicFlute:
    case ItrKind.MagicFlute2: {
      itr.motionless = 0;
      itr.shaking = 0;
      itr.test = new CondMaker<C_Val>()
        .add(C_Val.VictimType, "==", EntityEnum.Fighter)
        .or((c) =>
          c
            .add(C_Val.VictimType, "==", EntityEnum.Weapon)
            .and(C_Val.VictimOID, "!=", BuiltIn_OID.HenryArrow1)
            .and(C_Val.VictimOID, "!=", BuiltIn_OID.RudolfWeapon),
        )
        .done();
      return;
    }
    case ItrKind.ForceCatch: {
      itr.motionless = 0;
      itr.shaking = 0;
      if (itr.vrest) {
        itr.arest = itr.vrest;
        delete itr.vrest;
      }
      itr.test = new CondMaker<C_Val>()
        .and(C_Val.VictimType, "==", EntityEnum.Fighter)
        .and(C_Val.VictimState, "!=", StateEnum.Falling)
        .done();
      break;
    }
    case ItrKind.Catch: {
      itr.motionless = 0;
      itr.shaking = 0;
      if (itr.vrest) {
        itr.arest = itr.vrest;
        delete itr.vrest;
      }
      itr.test = new CondMaker<C_Val>()
        .and(C_Val.VictimType, "==", EntityEnum.Fighter)
        .and(C_Val.VictimState, "==", StateEnum.Tired)
        .done();
      break;
    }
    case ItrKind.Block:
      itr.ally_flags = AllyFlag.Both;
      itr.motionless = 0;
      itr.shaking = 0;
      itr.test = new CondMaker<C_Val>()
        .add(C_Val.BdyKind, "==", BdyKind.Normal)
        .done();
      break;
    case ItrKind.JohnShield:
      itr.ally_flags = AllyFlag.Both;
      itr.test = new CondMaker<C_Val>()
        .and(C_Val.VictimType, "!=", EntityEnum.Fighter)
        .or(C_Val.SameTeam, "!=", 1)
        .done();
      break;
    case ItrKind.Heal: {
      itr.ally_flags = AllyFlag.Both; // 允许治疗队友


      if (src_dvx) {
        itr.actions = ensure(itr.actions, {
          type: 'next_frame',
          data: get_next_frame_by_raw_id(src_dvx),
        })
      }
      itr.test = new CondMaker<C_Val>()
        .and(C_Val.VictimType, "==", EntityEnum.Fighter)
        .done();
      break;
    }
    case ItrKind.Freeze: {
      itr.ally_flags = AllyFlag.Both;
      itr.shaking = 0;
      itr.motionless = 0;
      itr.dvx = 0;
      itr.dvy = 0;
      itr.dvz = 0;
      itr.test = new CondMaker<C_Val>()
        .add(C_Val.VictimType, "==", EntityEnum.Fighter)
        .and((c) =>
          c
            .add(C_Val.SameTeam, "==", 0)
            .or(C_Val.VictimState, "==", StateEnum.Frozen),
        )
        .done();
      break;
    }
    case ItrKind.Whirlwind: {
      itr.ally_flags = AllyFlag.Both;
      itr.shaking = 0;
      itr.motionless = 0;
      itr.vrest = 1;
      itr.injury = void 0;
      itr.dvx = 0;
      itr.dvy = 0;
      itr.dvz = 0;
      itr.test = new CondMaker<C_Val>()
        .wrap((c) =>
          c
            .add(C_Val.VictimType, "==", EntityEnum.Weapon)
            .and(C_Val.VictimOID, "!=", BuiltIn_OID.HenryArrow1)
            .and(C_Val.VictimOID, "!=", BuiltIn_OID.Rudolf),
        )
        .or((c) =>
          c
            .add(C_Val.VictimType, "==", EntityEnum.Fighter)
            .and((c) =>
              c
                .add(C_Val.SameTeam, "==", 0)
                .or(C_Val.VictimState, "==", StateEnum.Frozen),
            ),
        )
        .done();
      break;
    }
    case ItrKind.CharacterThrew: {
      itr.ally_flags = AllyFlag.Both;
      itr.test = new CondMaker<C_Val>()
        .add(C_Val.AttackerThrew, "==", 1)
        .and(C_Val.AttackerType, "==", EntityEnum.Fighter)
        .done();
      break;
    }
  }
  const catchingact = take(itr, "catchingact");
  if (is_num(catchingact))
    itr.catchingact = get_next_frame_by_raw_id(catchingact);

  const caughtact = take(itr, "caughtact");
  if (is_num(caughtact))
    itr.caughtact = {
      ...get_next_frame_by_raw_id(caughtact),
      facing: FacingFlag.OpposingCatcher,
    };
}
