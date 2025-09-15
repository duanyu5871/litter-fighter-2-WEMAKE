import { IBdyInfo } from "../defines/IBdyInfo";
import { IFrameInfo } from "../defines/IFrameInfo";
import { IItrInfo } from "../defines/IItrInfo";
import { ItrEffect } from "../defines/ItrEffect";
import { ItrKind } from "../defines/ItrKind";
import { IEntityData } from "../defines/IEntityData";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { EntityEnum } from "../defines/EntityEnum";
import { CondMaker } from "./CondMaker";
import { copy_bdy_info } from "./copy_bdy_info";
import { edit_bdy_info } from "./edit_bdy_info";
import { edit_itr_info } from "./edit_itr_info";
import { AllyFlag } from "../defines/AllyFlag";
import { ensure } from "../utils";
import { ActionType } from "../defines/ActionType";

export function cook_ball_frame_state_3000(e: IEntityData, frame: IFrameInfo) {
  const bdy_list = frame.bdy ? frame.bdy : (frame.bdy = []);
  const new_bdy: IBdyInfo[] = [];
  for (const bdy of bdy_list) {
    edit_bdy_info(bdy, {
      /* 受攻击判定 */
      test: new CondMaker<C_Val>()
        .add(C_Val.ItrKind, "!=", ItrKind.JohnShield)
        .and(C_Val.ItrKind, "!=", ItrKind.Block)
        .and((c) => c
          .add(C_Val.AttackerType, "==", EntityEnum.Ball).or((c) => c
            /** 被武器s击中 */
            .add(C_Val.AttackerType, "==", EntityEnum.Weapon)
            .and(C_Val.ItrKind, "!=", ItrKind.WeaponSwing),
          ),
        ).and().not_in(
          C_Val.ItrKind,
          ItrKind.Block,
          ItrKind.MagicFlute,
          ItrKind.MagicFlute2,
          ItrKind.Pick,
          ItrKind.PickSecretly,
        )
        .and().not_in(
          C_Val.ItrEffect,
          ItrEffect.Ice2,
          ItrEffect.MFire1
        ).done(),
      actions: [{
        type: ActionType.V_NextFrame,
        data: {
          id: "20"
        }
      }]
    });

    new_bdy.push(
      copy_bdy_info(bdy, {
        /* 反弹判定 */
        ally_flags: AllyFlag.Both,
        test: new CondMaker<C_Val>()
          .wrap((c) => c
            // 敌方角色的攻击反弹气功波
            .add(C_Val.SameTeam, "==", 0)
            .and(C_Val.AttackerType, "==", EntityEnum.Fighter)
            .and(C_Val.ItrKind, "==", ItrKind.Normal)
            .and(C_Val.ItrEffect, "!=", ItrEffect.Ice)
            .and(C_Val.ItrEffect, "!=", ItrEffect.MFire1),
          )
          .or((c) => c
            // 队友角色的攻击必须相向才能反弹气功波
            .add(C_Val.SameTeam, "==", 1)
            .and(C_Val.AttackerType, "==", EntityEnum.Fighter)
            .and(C_Val.SameFacing, "==", 0)
            .and(C_Val.ItrKind, "==", ItrKind.Normal)
            .and(C_Val.ItrEffect, "!=", ItrEffect.Ice),
          )
          .or(C_Val.ItrKind, "==", ItrKind.JohnShield)
          .or((c) => c
            // 队友角色的攻击 挥动武器(必须相向) 反弹气功波
            .add(C_Val.SameTeam, "==", 1)
            .and(C_Val.SameFacing, "==", 0)
            .and(C_Val.ItrKind, "==", ItrKind.WeaponSwing),
          )
          .or((c) => c
            // 敌人角色的攻击 挥动武器 反弹气功波
            .add(C_Val.SameTeam, "==", 0)
            .and(C_Val.ItrKind, "==", ItrKind.WeaponSwing),
          )
          .and().not_in(
            C_Val.ItrKind,
            ItrKind.Block,
            ItrKind.MagicFlute,
            ItrKind.MagicFlute2,
            ItrKind.Pick,
            ItrKind.PickSecretly,
          )
          .and().not_in(
            C_Val.ItrEffect,
            ItrEffect.Ice2,
            ItrEffect.MFire1
          )
          .done(),
        actions: [{
          type: ActionType.V_NextFrame,
          data: {
            id: "30"
          }
        }]
      }),
    );
  }
  bdy_list.push(...new_bdy);

  const itr_list = frame.itr ? frame.itr : (frame.itr = []);
  const new_itr: IItrInfo[] = [];
  for (const itr of itr_list) {
    switch (itr.kind) {
      case ItrKind.Normal:
        itr.actions = ensure(itr.actions, {
          type: ActionType.A_NextFrame,
          data: { id: "10" }
        });
        break;
    }
  }
  itr_list.push(...new_itr);
}
