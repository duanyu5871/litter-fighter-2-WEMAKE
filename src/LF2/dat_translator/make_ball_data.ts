import { IBdyInfo, IEntityData, ItrEffect, ItrKind } from "../defines";
import { CollisionVal } from "../defines/CollisionVal";
import { EntityVal } from "../defines/EntityVal";
import { IDatIndex } from "../defines/IDatIndex";
import { IEntityInfo } from "../defines/IEntityInfo";
import { IFrameInfo } from "../defines/IFrameInfo";
import { OpointKind } from "../defines/OpointKind";
import { Defines } from "../defines/defines";
import { traversal } from "../utils/container_help/traversal";
import { to_num } from "../utils/type_cast/to_num";
import { CondMaker } from "./CondMaker";
import { copy_bdy_info } from "./copy_bdy_info";
import { edit_bdy_info } from "./edit_bdy_info";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take, take_str } from "./take";

export function make_ball_data(info: IEntityInfo, frames: Record<string, IFrameInfo>, datIndex: IDatIndex): IEntityData {

  info.hp = 500;

  let weapon_broken_sound = take_str(info, 'weapon_broken_sound')
  if (weapon_broken_sound) { weapon_broken_sound += '.mp3'; info.dead_sounds = [weapon_broken_sound] }

  let weapon_drop_sound = take_str(info, 'weapon_drop_sound')
  if (weapon_drop_sound) { weapon_drop_sound += '.mp3'; info.drop_sounds = [weapon_drop_sound] }

  let weapon_hit_sound = take_str(info, 'weapon_hit_sound');
  if (weapon_hit_sound) { weapon_hit_sound += '.mp3'; info.hit_sounds = [weapon_hit_sound] }

  for (const [, frame] of traversal(frames)) {

    const hit_j = take(frame, 'hit_j');
    if (hit_j !== 0) frame.dvz = to_num(hit_j, 50) - 50;

    const hit_a = take(frame, 'hit_a');
    const hit_d = take(frame, 'hit_d');
    const hit_Fa = take(frame, 'hit_Fa')

    if ('' + hit_Fa === '13') {
      /*
      13 = 連環重炮的開始
       其实就是放出一个id为228的实体
      */
      frame.opoint = frame.opoint || []
      frame.opoint.push({
        kind: OpointKind.Normal,
        oid: '228',
        x: frame.centerx,
        y: frame.centery,
        action: { id: '50' }
      })
    } else if ('' + hit_Fa === '8') {
      frame.opoint = frame.opoint || []
      frame.opoint.push({
        kind: OpointKind.Normal,
        oid: '225',
        x: frame.centerx,
        y: frame.centery,
        action: { id: '0' },
        multi: 3
      })
    } else if (hit_Fa) {
      frame.behavior = hit_Fa;
    }

    /*
      1= 追敵人的center(因為敵人站在地面，所以會下飄)
      2= 水平追敵
      3= 加速法追敵(追縱力較差)
      4= 天使之祝福(別的dat檔用了無效)
      5= 天使之祝福的開始(會追我方的人物很久)
      6= 惡魔之審判的開始(視敵人數目而增加，基本上是一個)
      7= 惡魔之審判,殃殞天降(可以做出打到地面的追蹤波)
      8= 吸血蝙蝠的開始(視敵人數目而增加，基本數值是三個，別的dat檔用了無效)
      9= 殃殞天降的開始(視敵人數目而增加，基本數值是四個)
      10= 加速(從慢變快)
      11= 極地火山
      12= 吸血蝙蝠
      14= 連環重炮
    */

    if (hit_a) frame.hp = hit_a / 2;
    if (hit_d) frame.on_dead = get_next_frame_by_raw_id(hit_d);

    if (frame.itr) {
      for (const itr of frame.itr) {
        if (itr.kind === ItrKind.JohnShield) {
          if (hit_d) {
            itr.hit_act = [{
              id: hit_d,
              expression: new CondMaker<EntityVal>()
                .add(EntityVal.HitOnCharacter, '==', 1)
                .done()
            }]
          }
        }
        if (
          weapon_hit_sound &&
          itr.kind !== ItrKind.Wind &&
          itr.kind !== ItrKind.Freeze &&
          itr.kind !== ItrKind.Block
        ) {
          itr.hit_sounds = [weapon_hit_sound]
        };
      }
    }
    if (frame.state === Defines.State.Ball_Flying) {
      cook_state_frame_3000(frame, frames, weapon_broken_sound);
    } else if (frame.state === Defines.State.Ball_3005) {
      frame.speedz = 0;
      if (frame.bdy && frames[20]) {
        for (const bdy of frame.bdy) {
          bdy.hit_act = [{
            id: '20',
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.HitByState, '{{', 3005)
              .or(EntityVal.HitByItrKind, '{{', ItrKind.JohnShield)
              .done()
          }]
        }
      }
      if (frame.itr && frames[20]) {
        for (const itr of frame.itr) {
          itr.hit_act = [{
            id: '20',
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.HitOnState, '{{', 3005)
              .done()
          }]
        }
      }

    } else if (frame.state === Defines.State.Ball_3006) {
      frame.speedz = 2;
      if (frame.bdy && frames[20]) {
        for (const bdy of frame.bdy) {
          bdy.hit_act = [{
            id: '20',
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.HitByState, '{{', 3005)
              .or(EntityVal.HitByState, '{{', 3006)
              .or(EntityVal.HitByItrKind, '{{', ItrKind.JohnShield)
              .done()
          }]
        }
      }
      if (frame.itr && frames[20]) {
        for (const itr of frame.itr) {
          itr.hit_act = [{
            id: '20',
            expression: new CondMaker<EntityVal>()
              .add(EntityVal.HitOnState, '{{', 3005)
              .or(EntityVal.HitOnState, '{{', 3006)
              .done()
          }]
        }
      }
    } else if (frame.state === Defines.State.Burning) {
      if (frame.itr && Number(datIndex?.id) === 211) {
        for (const itr of frame.itr) {
          delete itr.friendly_fire;
        }
      }
    }

    switch ('' + datIndex?.id) {
      case '223':
      case '224':
        frame.speedz = 0;
        frame.no_shadow = 1;
        break;
    }
    // 223、224
    // frame.hp = (50 to_num(take(frame, 'hit_a'), 0)) / 2
  }
  const ret: IEntityData = {
    id: '',
    type: 'ball',
    base: info,
    frames: frames
  };
  return ret
}

function cook_state_frame_3000(frame: IFrameInfo, frames: Record<string, IFrameInfo>, weapon_broken_sound: string | undefined) {
  if (frame.bdy && frames[20]) {
    const more_bdy: IBdyInfo[] = [];
    for (const bdy of frame.bdy) {

      edit_bdy_info(bdy, {
        /* 受攻击判定 */
        test: new CondMaker<CollisionVal>().bracket(c => c
          /** 被john盾牌之外的气功波击中 */
          .add(CollisionVal.AttackerType, '==', 'ball')
          .and(CollisionVal.ItrKind, '==', ItrKind.JohnShield)
        ).or(c => c
          /** 被武器s击中 */
          .add(CollisionVal.AttackerType, '==', 'weapon')
          .and(CollisionVal.ItrKind, '!=', ItrKind.WeaponSwing)
        ).done(),
        hit_act: [{
          id: '20',
          sounds: weapon_broken_sound ? [weapon_broken_sound] : void 0
        }]
      })

      more_bdy.push(copy_bdy_info(bdy, {
        /* 反弹判定 */
        friendly_fire: 1,
        test: new CondMaker<CollisionVal>().bracket(c => c
          // 地方角色的攻击反弹气功波
          .add(CollisionVal.FriendlyFire, '==', 0)
          .and(CollisionVal.AttackerType, '==', 'character')
          .add(CollisionVal.ItrKind, '==', ItrKind.Normal)
          .add(CollisionVal.ItrEffect, '!=', ItrEffect.Ice)
        ).or(c => c
          // 队友角色的攻击必须相向才能反弹气功波
          .add(CollisionVal.FriendlyFire, '==', 1)
          .and(CollisionVal.AttackerType, '==', 'character')
          .and(CollisionVal.SameFacing, '==', 0)
          .add(CollisionVal.ItrKind, '==', ItrKind.Normal)
          .add(CollisionVal.ItrEffect, '!=', ItrEffect.Ice)
        ).or(
          CollisionVal.ItrKind, '==', ItrKind.JohnShield
        ).or(c => c
          // 队友角色的攻击 挥动武器 必须相向 反弹气功波
          .add(CollisionVal.FriendlyFire, '==', 1)
          .and(CollisionVal.SameFacing, '==', 0)
          .add(CollisionVal.ItrKind, '==', ItrKind.WeaponSwing)
        ).or(c => c
          // 敌人角色的攻击 挥动武器 反弹气功波
          .add(CollisionVal.FriendlyFire, '==', 0)
          .add(CollisionVal.ItrKind, '==', ItrKind.WeaponSwing)
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