import { IEntityData } from "../defines";
import { IFrameInfo } from "../defines/IFrameInfo";
import { IDatIndex } from "../defines/IDatIndex";
import { IEntityInfo } from "../defines/IEntityInfo";
import { Defines } from "../defines/defines";
import { traversal } from "../utils/container_help/traversal";
import { to_num } from "../utils/type_cast/to_num";
import { CondMaker } from "./CondMaker";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take, take_str } from "./take";

export function make_ball_data(info: IEntityInfo, frames: Record<string, IFrameInfo>, datIndex?: IDatIndex): IEntityData {

  info.hp = 500;

  let sound_1 = take_str(info, 'weapon_broken_sound')
  if (sound_1) { sound_1 += '.mp3'; info.dead_sounds = [sound_1] }

  let sound_2 = take_str(info, 'weapon_drop_sound')
  if (sound_2) { sound_2 += '.mp3'; info.drop_sounds = [sound_2] }

  let sound_3 = take_str(info, 'weapon_hit_sound');
  if (sound_3) { sound_3 += '.mp3'; info.hit_sounds = [sound_3] }

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
        oid: '228',
        x: frame.centerx,
        y: frame.centery,
        action: { id: '50' }
      })
    } else if ('' + hit_Fa === '8') {
      frame.opoint = frame.opoint || []
      frame.opoint.push({
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
        if (itr.kind === Defines.ItrKind.JohnShield) {
          if (hit_d) {
            itr.hit_act = [{
              id: hit_d,
              expression: CondMaker
                .add(Defines.ValWord.HitOnCharacter, '==', 1)
                .done()
            }]
          }
        }
        if (sound_3) itr.hit_sounds = [sound_3];
      }
    }
    if (frame.bdy && sound_3) {
      for (const bdy of frame.bdy) {
        bdy.hit_sounds = [sound_3];
      }
    }


    if (frame.state === Defines.State.Ball_Flying) {
      if (frame.bdy && frames[20]) {
        for (const bdy of frame.bdy) {
          bdy.hit_act = [{
            id: '20',
            expression: CondMaker
              .add<Defines.ValWord>(Defines.ValWord.HitByBall, '==', 1)
              .and(Defines.ValWord.HitByItrKind, '!{', Defines.ItrKind.JohnShield)
              .done()
          }, {
            id: '30', // 反弹逻辑
            expression: CondMaker
              .add(Defines.ValWord.HitByItrKind, '{{', Defines.ItrKind.WeaponSwing)
              .or(Defines.ValWord.HitByItrKind, '{{', Defines.ItrKind.JohnShield)
              .or(c => c
                .add(Defines.ValWord.HitOnSth, '==', 0)
                .and(c => c
                  .add(Defines.ValWord.HitByCharacter, '==', 1)
                  .and((c => c
                    .add(Defines.ValWord.HitByItrKind, '!{', Defines.ItrKind.Normal)
                    .or(Defines.ValWord.HitByItrEffect, '!{', Defines.ItrEffect.Fire)
                  ))
                ))
              .done()
          }]
        }
      }
      if (frame.itr && frames[10]) {
        for (const itr of frame.itr) {
          itr.hit_act = [{ id: '10' }]
        }
      }
    } else if (frame.state === Defines.State.Ball_3005) {
      frame.speedz = 0;
      if (frame.bdy && frames[20]) {
        for (const bdy of frame.bdy) {
          bdy.hit_act = [{
            id: '20',
            expression: CondMaker
              .add<Defines.ValWord>(Defines.ValWord.HitByState, '{{', 3005)
              .or(Defines.ValWord.HitByItrKind, '{{', Defines.ItrKind.JohnShield)
              .done()
          }]
        }
      }
      if (frame.itr && frames[20]) {
        for (const itr of frame.itr) {
          itr.hit_act = [{
            id: '20',
            expression: CondMaker
              .add(Defines.ValWord.HitOnState, '{{', 3005)
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
            expression: CondMaker
              .add<Defines.ValWord>(Defines.ValWord.HitByState, '{{', 3005)
              .or(Defines.ValWord.HitByState, '{{', 3006)
              .or(Defines.ValWord.HitByItrKind, '{{', Defines.ItrKind.JohnShield)
              .done()
          }]
        }
      }
      if (frame.itr && frames[20]) {
        for (const itr of frame.itr) {
          itr.hit_act = [{
            id: '20',
            expression: CondMaker
              .add(Defines.ValWord.HitOnState, '{{', 3005)
              .or(Defines.ValWord.HitOnState, '{{', 3006)
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
