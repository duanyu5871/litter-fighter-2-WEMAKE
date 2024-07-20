import { IBallData } from "../defines";
import { IBallFrameInfo } from "../defines/IBallFrameInfo";
import { IBallInfo } from "../defines/IBallInfo";
import { IDatIndex } from "../defines/IDatIndex";
import { Defines } from "../defines/defines";
import { traversal } from "../utils/container_help/traversal";
import { to_num } from "../utils/type_cast/to_num";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take } from "./take";

export function make_ball_data(info: IBallInfo, frames: Record<string, IBallFrameInfo>, datIndex?: IDatIndex): IBallData {

  for (const [, frame] of traversal(frames)) {
    const hit_j = take(frame, 'hit_j');
    if (hit_j !== 0) frame.dvz = to_num(hit_j, 50) - 50;

    const hit_a = take(frame, 'hit_a');
    const hit_d = take(frame, 'hit_d');
    const hit_Fa = take(frame, 'hit_Fa')
    if(hit_Fa) frame.behavior = hit_Fa;
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
      13= 連環重炮的開始
      14= 連環重炮
    */

    if (hit_a) frame.hp = hit_a / 2;
    if (hit_d) frame.on_timeout = get_next_frame_by_raw_id(hit_d);
    if (frame.state === Defines.State.Ball_Flying) {
      frame.speedz = 2;
      if (frames[10]) frame.on_hitting = { id: '10' }
      if (frames[20]) frame.on_be_hit = { id: '20' }
      if (frames[30]) frame.on_rebounding = { id: '30' }
      if (frames[40]) frame.on_disappearing = { id: '40' }
    } else if (frame.state === Defines.State.Ball_Sturdy) {
      frame.speedz = 0;
    } else if (frame.state === Defines.State.Ball_PunchThrough) {
      frame.speedz = 2;
    } else if (frame.state === 18) {
      if (frame.itr && Number(datIndex?.id) === 229) {
        // julian ball 2 explosion
        for (const itr of frame.itr) {
          itr.friendly_fire = 1;
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
  info.hp = 500;

  const sound_1 = take(info, 'weapon_broken_sound')
  if (sound_1) info.weapon_broken_sound = sound_1 + '.mp3'

  const sound_2 = take(info, 'weapon_drop_sound')
  if (sound_2) info.weapon_drop_sound = sound_2 + '.mp3'

  const sound_3 = take(info, 'weapon_hit_sound')
  if (sound_3) info.weapon_hit_sound = sound_3 + '.mp3'

  const ret: IBallData = {
    id: '',
    type: 'ball',
    base: info,
    frames: frames,
    is_ball_data: true,
    is_game_obj_data: true,
    is_base_data: true
  };
  return ret
}
