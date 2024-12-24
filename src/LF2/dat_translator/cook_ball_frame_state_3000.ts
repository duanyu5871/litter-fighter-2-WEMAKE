import { IBdyInfo, IFrameInfo, ItrEffect, ItrKind } from "../defines";
import { CollisionVal } from "../defines/CollisionVal";
import { EntityEnum } from "../defines/EntityEnum";
import { CondMaker } from "./CondMaker";
import { copy_bdy_info } from "./copy_bdy_info";
import { edit_bdy_info } from "./edit_bdy_info";

export function cook_ball_frame_state_3000(frame: IFrameInfo, frames: Record<string, IFrameInfo>, weapon_broken_sound: string | undefined) {
  if (frame.bdy && frames[20]) {
    const more_bdy: IBdyInfo[] = [];
    for (const bdy of frame.bdy) {
      edit_bdy_info(bdy, {
        /* 受攻击判定 */
        test: new CondMaker<CollisionVal>()
          .add(
            CollisionVal.ItrKind, '!=', ItrKind.JohnShield
          ).and(c => c
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
          sounds: weapon_broken_sound ? [weapon_broken_sound] : void 0
        }]
      });

      more_bdy.push(copy_bdy_info(bdy, {
        /* 反弹判定 */
        friendly_fire: 1,
        test: new CondMaker<CollisionVal>().bracket(c => c
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
          // 队友角色的攻击 挥动武器 必须相向 反弹气功波
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
          sounds: weapon_broken_sound ? [weapon_broken_sound] : void 0
        }
      }));
    }
    frame.bdy.push(...more_bdy);
  }
  if (frame.itr && frames[10]) {
    for (const itr of frame.itr) {
      switch (itr.kind) {
        case ItrKind.Block:
          break;
        default:
          itr.hit_act = [{ id: '10' }];
      }
    }
  }
}
