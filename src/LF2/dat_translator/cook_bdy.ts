import { HitFlag } from "../defines/HitFlag";
import { bdy_kind_full_name, BdyKind } from "../defines/BdyKind";
import { BuiltIn_OID } from "../defines/BuiltIn_OID";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { Defines } from "../defines/defines";
import { EntityEnum } from "../defines/EntityEnum";
import { BdyKeyOrders as bdy_key_orders, IBdyInfo } from "../defines/IBdyInfo";
import { ItrKind } from "../defines/ItrKind";
import { sort_key_value } from "../utils";
import { is_num } from "../utils/type_check";
import { CondMaker } from "./CondMaker";
import { take } from "./take";

export default function cook_bdy(bdy?: Partial<IBdyInfo>): void {
  if (!bdy) return;
  bdy.kind_name = bdy_kind_full_name(bdy.kind);
  bdy.hit_flag = HitFlag.Enemy;
  bdy.l = Defines.DAFUALT_QUBE_LENGTH;
  bdy.z = -Defines.DAFUALT_QUBE_LENGTH / 2;
  const kind = take(bdy, "kind");
  if (is_num(kind)) bdy.kind = kind;
  if (bdy.kind && bdy.kind >= BdyKind.GotoMin && bdy.kind <= BdyKind.GotoMax) {
    bdy.test = new CondMaker<C_Val>()
      .add(C_Val.SameTeam, "==", 0)
      .and((c) => c
        .wrap((c) => c
          .add(C_Val.AttackerType, "==", EntityEnum.Fighter)
          .and(C_Val.ItrKind, "==", ItrKind.Normal),
        )
        .or((c) => c
          .add(C_Val.AttackerType, "==", EntityEnum.Weapon)
          .and((c) => c
            .add(C_Val.ItrKind, "==", ItrKind.WeaponSwing)
            .or(C_Val.AttackerOID, "==", BuiltIn_OID.HenryArrow1)
            .or(C_Val.AttackerOID, "==", BuiltIn_OID.RudolfWeapon,
            ),
          ),
        ),
      )
      .done();
  }
  sort_key_value(bdy, bdy_key_orders)
}
