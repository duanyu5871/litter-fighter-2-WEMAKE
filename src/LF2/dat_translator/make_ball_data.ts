import { IEntityData, ItrKind } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { EntityVal } from "../defines/EntityVal";
import { IDatIndex } from "../defines/IDatIndex";
import { IEntityInfo } from "../defines/IEntityInfo";
import { IFrameInfo } from "../defines/IFrameInfo";
import { OpointKind } from "../defines/OpointKind";
import { Defines } from "../defines/defines";
import { traversal } from "../utils/container_help/traversal";
import { to_num } from "../utils/type_cast/to_num";
import { CondMaker } from "./CondMaker";
import { cook_ball_frame_state_3000 } from "./cook_ball_frame_state_3000";
import { cook_ball_frame_state_3005 } from "./cook_ball_frame_state_3005";
import { cook_ball_frame_state_3006 } from "./cook_ball_frame_state_3006";
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

  }
  const ret: IEntityData = {
    id: datIndex.id,
    type: EntityEnum.Ball,
    base: info,
    frames: frames
  };

  traversal(ret.frames, (_, frame) => {
    switch (frame.state) {
      case Defines.State._3000:
        return cook_ball_frame_state_3000(ret, frame);
      case Defines.State._3005:
        return cook_ball_frame_state_3005(ret, frame);
      case Defines.State.Ball_3006:
        return cook_ball_frame_state_3006(ret, frame);
    }

  })
  return ret
}


