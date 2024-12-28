import { Defines, IBdyInfo, ItrKind } from "../defines";
import { BdyKind } from "../defines/BdyKind";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { EntityEnum } from "../defines/EntityEnum";
import { is_num } from "../utils/type_check";
import { CondMaker } from "./CondMaker";
import { take } from "./take";

export default function cook_bdy(bdy?: Partial<IBdyInfo>): void {
  if (!bdy) return;
  bdy.l = Defines.DAFUALT_QUBE_LENGTH;
  bdy.z = -Defines.DAFUALT_QUBE_LENGTH / 2;
  const kind = take(bdy, "kind");
  if (is_num(kind)) bdy.kind = kind;
  if (bdy.kind && bdy.kind >= BdyKind.GotoMin && bdy.kind <= BdyKind.GotoMax) {
    bdy.test = new CondMaker<C_Val>()
      .add(C_Val.SameTeam, "==", 0)
      .and((c) =>
        c
          .wrap((c) =>
            c
              .add(C_Val.AttackerType, "==", EntityEnum.Character)
              .and(C_Val.ItrKind, "==", ItrKind.Normal),
          )
          .or((c) =>
            c
              .add(C_Val.AttackerType, "==", EntityEnum.Weapon)
              .and((c) =>
                c
                  .add(C_Val.ItrKind, "==", ItrKind.WeaponSwing)
                  .or(C_Val.AttackerOID, "==", Defines.BuiltIn_OID.Henry_Arrow1)
                  .or(
                    C_Val.AttackerOID,
                    "==",
                    Defines.BuiltIn_OID.Rudolf_Weapon,
                  ),
              ),
          ),
      )
      .done();
  }
}
