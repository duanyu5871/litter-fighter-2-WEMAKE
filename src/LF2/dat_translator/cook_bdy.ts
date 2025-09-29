import { ActionType } from "../defines/ActionType";
import { bdy_kind_full_name, BdyKind, OLD_BDY_KIND_GOTO_MAX, OLD_BDY_KIND_GOTO_MIN } from "../defines/BdyKind";
import { BuiltIn_OID } from "../defines/BuiltIn_OID";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { Defines } from "../defines/defines";
import { EntityEnum } from "../defines/EntityEnum";
import { HitFlag } from "../defines/HitFlag";
import { BdyKeyOrders as bdy_key_orders, IBdyInfo } from "../defines/IBdyInfo";
import { ItrKind } from "../defines/ItrKind";
import { between, ensure, sort_key_value } from "../utils";
import { is_num } from "../utils/type_check";
import { CondMaker } from "./CondMaker";
import { take } from "./take";

export default function cook_bdy(bdy?: Partial<IBdyInfo>): void {
  if (!bdy) return;
  bdy.kind_name = bdy_kind_full_name(bdy.kind);
  bdy.hit_flag = HitFlag.AllEnemy;
  bdy.l = Defines.DAFUALT_QUBE_LENGTH;
  bdy.z = -Defines.DAFUALT_QUBE_LENGTH / 2;
  let kind = take(bdy, "kind");
  if (!is_num(kind)) kind = Number(kind);
  bdy.kind = kind;

  if (between(kind, OLD_BDY_KIND_GOTO_MIN, OLD_BDY_KIND_GOTO_MAX)) {
    bdy.kind = BdyKind.Criminal;
    bdy.kind_name = bdy_kind_full_name(kind);
    bdy.test = new CondMaker<C_Val>()
      .add(c => c
        .add(C_Val.SameTeam, "==", 0)
        .and(C_Val.AttackerType, "==", EntityEnum.Fighter)
        .and(C_Val.ItrKind, "==", ItrKind.Normal),
      ).or(c => c
        .add(C_Val.SameTeam, "==", 0)
        .and(C_Val.AttackerType, "==", EntityEnum.Weapon)
        .and(c => c
          .add(C_Val.ItrKind, "==", ItrKind.WeaponSwing)
          .or(C_Val.AttackerOID, "==", BuiltIn_OID.HenryArrow1)
          .or(C_Val.AttackerOID, "==", BuiltIn_OID.RudolfWeapon),
        ),
      )
      .done();
    bdy.actions = ensure(bdy.actions, {
      type: ActionType.V_NextFrame,
      data: { id: "" + (kind - 1000) },
    }, {
      type: ActionType.V_TURN_TEAM,
      data: ""
    })
  }
  sort_key_value(bdy, bdy_key_orders)
}
