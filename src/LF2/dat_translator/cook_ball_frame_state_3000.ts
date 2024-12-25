import { IBdyInfo, IEntityData, IFrameInfo, ItrEffect, ItrKind } from "../defines";
import { CollisionVal } from "../defines/CollisionVal";
import { EntityEnum } from "../defines/EntityEnum";
import { CondMaker } from "./CondMaker";
import { copy_bdy_info } from "./copy_bdy_info";
import { edit_bdy_info } from "./edit_bdy_info";

export function cook_ball_frame_state_3000(e: IEntityData, frame: IFrameInfo) {
  const bdy_list = frame.bdy ? frame.bdy : (frame.bdy = []);
  const new_bdy: IBdyInfo[] = [];
  for (const bdy of bdy_list) {
    edit_bdy_info(bdy, {
      /* 受攻击判定 */
      test: new CondMaker<CollisionVal>()
        .add(CollisionVal.ItrKind, '!=', ItrKind.JohnShield)
        .and(CollisionVal.ItrKind, '!=', ItrKind.Block)
        .and(c => c
          .add(
            CollisionVal.AttackerType, '==', EntityEnum.Ball
          ).or(c => c
            /** 被武器s击中 */
            .add(CollisionVal.AttackerType, '==', EntityEnum.Weapon)
            .and(CollisionVal.ItrKind, '!=', ItrKind.WeaponSwing)
          )
        ).done(),

      hit_act: [{
        id: '20',
        sounds: e.base.dead_sounds
      }]
    });

    new_bdy.push(copy_bdy_info(bdy, {
      /* 反弹判定 */
      friendly_fire: 1,
      test: new CondMaker<CollisionVal>().wrap(c => c
        // 敌方角色的攻击反弹气功波
        .add(CollisionVal.SameTeam, '==', 0)
        .and(CollisionVal.AttackerType, '==', EntityEnum.Character)
        .and(CollisionVal.ItrKind, '==', ItrKind.Normal)
        .and(CollisionVal.ItrEffect, '!=', ItrEffect.Ice)
      ).or(c => c
        // 队友角色的攻击必须相向才能反弹气功波
        .add(CollisionVal.SameTeam, '==', 1)
        .and(CollisionVal.AttackerType, '==', EntityEnum.Character)
        .and(CollisionVal.SameFacing, '==', 0)
        .and(CollisionVal.ItrKind, '==', ItrKind.Normal)
        .and(CollisionVal.ItrEffect, '!=', ItrEffect.Ice)
      ).or(
        CollisionVal.ItrKind, '==', ItrKind.JohnShield
      ).or(c => c
        // 队友角色的攻击 挥动武器(必须相向) 反弹气功波
        .add(CollisionVal.SameTeam, '==', 1)
        .and(CollisionVal.SameFacing, '==', 0)
        .and(CollisionVal.ItrKind, '==', ItrKind.WeaponSwing)
      ).or(c => c
        // 敌人角色的攻击 挥动武器 反弹气功波
        .add(CollisionVal.SameTeam, '==', 0)
        .and(CollisionVal.ItrKind, '==', ItrKind.WeaponSwing)
      ).done(),
      hit_act: {
        id: '30', // 反弹
        sounds: e.base.dead_sounds
      }
    }));
  }
  bdy_list.push(...new_bdy);

  const itr_list = frame.itr ? frame.itr : (frame.itr = []);
  for (const itr of itr_list) {

    switch (itr.kind) {
      case ItrKind.Block:
        break;
      case ItrKind.Normal:
        itr.hit_act = [{ id: '10' }];
        break;
    }
  }
}
