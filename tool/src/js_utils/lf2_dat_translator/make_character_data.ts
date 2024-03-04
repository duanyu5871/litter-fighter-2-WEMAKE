import { arithmetic_progression } from '../arithmetic_progression';
import { take_number } from '../as_number';
import { IFrameInfo, ICharacterInfo, TFrameId, ICharacterData, TNextFrame } from '../lf2_type';
import { set_obj_field } from '../set_obj_field';
import { traversal } from '../traversal';
import { get_next_frame_by_id } from './get_the_next';
import { take } from './take';
const k_9 = [
  'Fa', 'Fj',
  'Da', 'Dj',
  'Ua', 'Uj', 'ja'
] as const;

const set_hit_turn_back = (frame: IFrameInfo, back_frame_id: string = '') => {
  frame.hit = frame.hit || {}
  frame.hit.B = { id: back_frame_id, flags: { wait: 'i', turn: 1 } }
}
const set_hold_turn_back = (frame: IFrameInfo, back_frame_id: string = '') => {
  frame.hold = frame.hold || {}
  frame.hold.B = { id: back_frame_id, flags: { wait: 'i', turn: 1 } }
}
export function make_character_data(info: ICharacterInfo, frames: Record<TFrameId, IFrameInfo>): ICharacterData {
  const walking_frame_rate = take_number(info, 'walking_frame_rate', 3);
  const running_frame_rate = take_number(info, 'running_frame_rate', 3);
  const walking_speed = take_number(info, 'walking_speed', 0);
  const walking_speedz = take_number(info, 'walking_speedz', 0);
  const running_speed = take_number(info, 'running_speed', 0);
  const running_speedz = take_number(info, 'running_speedz', 0);

  info.jump_height = info.jump_height * info.jump_height / 4;
  info.dash_height = info.dash_height * info.dash_height / 4;
  info.dash_distance /= 2;
  info.jump_distance /= 2;

  const round_trip_frames_map: any = {};
  for (const [frame_id, frame] of traversal(frames)) {

    if (frame.dvx) frame.dvx /= 2
    if (frame.dvy) frame.dvy /= 4
    if (frame.dvz) frame.dvz /= 2

    const hit_a = take(frame, 'hit_a');
    if (hit_a) frame.hit = set_obj_field(frame.hit, 'a', { id: hit_a });
    const hit_j = take(frame, 'hit_j');
    if (hit_j) frame.hit = set_obj_field(frame.hit, 'j', { id: hit_j });
    const hit_d = take(frame, 'hit_d');
    if (hit_d) frame.hit = set_obj_field(frame.hit, 'd', { id: hit_d });

    k_9.forEach(k => {
      const h_k = `hit_${k}`;
      const next = (frame as any)[h_k];
      if (!next || next === '0') return;

      if (!frame.hit) frame.hit = {};
      if (!frame.hit.sequences) frame.hit.sequences = {};

      const nf = get_next_frame_by_id(next);
      if (k === 'Fa' || k === 'Fj') {
        const f0 = frame.hit.sequences['L' + k[1]] = { ...nf };
        f0.flags = { ...nf.flags, turn: nf.flags?.turn === 1 ? 4 : 3 };
        const f1 = frame.hit.sequences['R' + k[1]] = { ...nf };
        f1.flags = { ...nf.flags, turn: nf.flags?.turn === 1 ? 3 : 4 };
      } else {
        frame.hit.sequences[k] = nf;
      }
    });


    switch (Number(frame.id)) {
      /** standing */
      case 0: case 1: case 2: case 3: case 4: {
        frame.hit = frame.hit || {};
        frame.hold = frame.hold || {};
        frame.hit.a = { id: [60, 65] }; // punch
        frame.hit.j = { id: 210 }; // jump
        frame.hit.d = { id: 110 }; // defend
        frame.hit.B = frame.hold.B = { id: 'walking_0', flags: { turn: 1 } }; // walking
        frame.hit.F = frame.hit.U = frame.hit.D =
          frame.hold.F = frame.hold.U = frame.hold.D = { id: 'walking_0' }; // walking
        frame.hit.FF = frame.hit.FF = { id: 'running_0' };
        break;
      }
      /** walking */
      case 5: case 6: case 7: case 8: {
        set_hit_turn_back(frame);
        set_hold_turn_back(frame);
        frame.hit = frame.hit || {};
        frame.hit.a = { id: [60, 65] }; // punch
        frame.hit.j = { id: 210 }; // jump
        frame.hit.d = { id: 110 }; // defend
        frame.hit.FF = { id: 'running_0' };
        frame.dvx = walking_speed / 2;
        frame.dvz = walking_speedz / 2;
        break;
      }
      /** running */
      case 9: case 10: case 11: {
        frame.hit = frame.hit || {};
        frame.hit.a = { id: 85 }; // run_atk
        frame.hit.j = { id: 213 }; // dash
        frame.hit.d = { id: 102 }; // rowing
        frame.hold = frame.hold || {};
        frame.hit.B = frame.hold.B = { id: 218 }; // running_stop
        frame.dvx = running_speed / 2;
        frame.dvz = running_speedz / 2;
        break;
      }
      /** heavy_obj_walk */
      case 12: case 13: case 14: case 15: {
        frame.hit = frame.hit || {};
        frame.hit.FF = { id: 'heavy_obj_run_0' };
        // TODO
        break;
      }
      /** heavy_obj_run */
      case 16: case 17: case 18: {
        frame.hit = frame.hit || {};
        frame.hold = frame.hold || {};
        frame.hit.B = frame.hold.B = { id: 19 }; // running_stop
        break;
      }
      /** defend */
      case 110:

      // eslint-disable-next-line no-fallthrough
      case 111: {
        set_hit_turn_back(frame);
        set_hold_turn_back(frame);
        break;
      }
      /** catching */
      case 121: {
        frame.hit = frame.hit || {};
        frame.hit.a = { id: 122 };
        break;
      }
      /** jump */
      case 210: case 211: case 212: {
        set_hit_turn_back(frame);
        set_hold_turn_back(frame);
        frame.hit = frame.hit || {};
        frame.hold = frame.hold || {};
        if (frame_id === '212') {
          frame.hit.a = { id: 80, flags: { turn: 2 }}; // jump_atk
          frame.hold.a = { id: 80, flags: { turn: 2 } }; // jump_atk
        }
        frame.hit.B = { id: '', flags: { turn: 2 } };
        frame.hold.B = { id: '', flags: { turn: 2 } };
        break;
      }
      /** dash */
      case 213: case 214: case 216: case 217: {
        frame.state = 5;
        if (frame_id === '213' && frames[214]) set_hit_turn_back(frame, '214'); // turn back;
        if (frame_id === '216' && frames[217]) set_hit_turn_back(frame, '217'); // turn back;
        if (frame_id === '214' && frames[213]) set_hit_turn_back(frame, '213'); // turn back;
        if (frame_id === '217' && frames[216]) set_hit_turn_back(frame, '216'); // turn back;
        if (frame_id === '213' || frame_id === '216') {
          frame.hit = frame.hit || {};
          frame.hit.a = { id: 90 }; // dash_atk
          frame.hold = frame.hold || {};
          frame.hold.a = { id: 90 }; // dash_atk
        }
        break;
      }
      /** crouch */
      case 215:
        const to_dash_frame: TNextFrame = [
          { id: 213, condition: 'presss_F_B == 1', flags: { turn: 2 } },
          { id: 213, condition: 'presss_F_B == -1', flags: { turn: 2 } },
          { id: 213, condition: 'trend_x == 1', flags: { turn: 2 } },
          { id: 214, condition: 'trend_x == -1' }
        ]; // dash
        frame.hit = frame.hit || {};
        frame.hit.d = { id: 102, flags: { turn: 2 } };
        frame.hit.j = to_dash_frame;
        frame.hold = frame.hold || {};
        frame.hold.d = { id: 102, flags: { turn: 2 } };
        frame.hold.j = to_dash_frame;
        break;
    }
    switch (frame.state) {
      case 1: case 2: {
        if (frame.state === 1) frame.wait = walking_frame_rate * 2;
        if (frame.state === 2) frame.wait = running_frame_rate * 2;
        round_trip_frames_map[frame.name] = round_trip_frames_map[frame.name] || [];
        round_trip_frames_map[frame.name].push(frame);
        delete frames[frame_id];
        break;
      }
      case 100: {
        frame.next = { id: Number(frame.id) + 1 };
        break;
      }
    }
  }
  const make_round_trip_frames = (prefix: string, src_frames: IFrameInfo[]) => {
    for (let i = 0; i < 2 * src_frames.length - 2; ++i) {
      const frame = i < src_frames.length ? src_frames[i] : { ...src_frames[2 * (src_frames.length - 1) - i] };
      frame.id = `${prefix}_${i}`;
      frame.next = { id: `${prefix}_${(i === 2 * src_frames.length - 3) ? 0 : (i + 1)}` };
      frames[frame.id] = frame;
    }
  };
  for (const key in round_trip_frames_map)
    make_round_trip_frames(key, round_trip_frames_map[key]);

  info.indexes = {} as any;
  info.indexes.standing = 0;
  info.indexes.running = "running_0";
  info.indexes.heavy_obj_run = "heavy_obj_run_0";
  info.indexes.super_punch = 70;
  info.indexes.defend_hit = 111;
  info.indexes.broken_defend = 112;
  info.indexes.picking_light = 115;
  info.indexes.picking_heavy = 117;
  info.indexes.weapen_atk = [20, 25];
  info.indexes.jump_weapen_atk = 30;
  info.indexes.run_weapen_atk = 35;
  info.indexes.dash_weapen_atk = 40;
  info.indexes.l_weapen_thw = 45;
  info.indexes.h_weapen_thw = 50;
  info.indexes.air_weapon_thw = 52;
  info.indexes.drink = 55;
  info.indexes.ice = 200;
  info.indexes.fire = [203, 205];
  info.indexes.air_quick_rise = [100, 108];
  info.indexes.injured = {
    [-1]: 220,
    1: 222,
  };
  info.indexes.dizzy = 226;
  info.indexes.lying = {
    [-1]: 230,
    1: 231,
  };
  info.indexes.grand_injured = {
    [-1]: [220],
    1: [222]
  };
  info.indexes.in_the_air = [212];
  info.indexes.throw_enemy = 232;
  info.indexes.catch = [120];
  info.indexes.catch_atk = 121;
  info.indexes.caughts = arithmetic_progression(130, 144);
  info.indexes.critical_hit = {
    [-1]: [180], 1: [186]
  }
  info.indexes.falling = {
    [-1]: arithmetic_progression(180, 183),
    1: arithmetic_progression(186, 189),
  };
  info.indexes.bouncing = {
    [-1]: arithmetic_progression(184, 185),
    1: arithmetic_progression(190, 191)
  }
  info.indexes.landing_1 = 215;
  info.indexes.landing_2 = 219;

  return {
    id: '',
    type: 'character',
    base: info,
    frames
  };
}
