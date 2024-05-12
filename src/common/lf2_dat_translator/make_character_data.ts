import { arithmetic_progression } from '../arithmetic_progression';
import { take_number } from '../as_number';
import { is_num } from '../type_check/is_num';
import { is_str } from '../type_check/is_str';
import { ICharacterData, ICharacterFrameInfo, TNextFrame } from '../lf2_type';
import { ICharacterFrameIndexes } from "../lf2_type/ICharacterFrameIndexes";
import { ICharacterInfo } from "../lf2_type/ICharacterInfo";
import { IFrameInfo } from "../lf2_type/IFrameInfo";
import { INextFrame } from "../lf2_type/INextFrame";
import { Defines } from '../lf2_type/defines';
import { set_obj_field } from '../set_obj_field';
import { traversal } from '../traversal';
import { Cond } from './Cond';
import { get_next_frame_by_raw_id } from './get_the_next';
import { take } from './take';
const k_9 = [
  'Fa', 'Fj',
  'Da', 'Dj',
  'Ua', 'Uj', 'ja'
] as const;


const { FacingFlag, ValWord, WeaponType, State } = Defines
const set_hit_turn_back = (frame: IFrameInfo, back_frame_id: string = '') => {
  frame.hit = frame.hit || {}
  frame.hit.B = { id: back_frame_id, wait: 'i', facing: FacingFlag.Backward }
}
const set_hold_turn_back = (frame: IFrameInfo, back_frame_id: string = '') => {
  frame.hold = frame.hold || {}
  frame.hold.B = { id: back_frame_id, wait: 'i', facing: FacingFlag.Backward }
}
export function make_character_data(info: ICharacterInfo, frames: Record<string, ICharacterFrameInfo>): ICharacterData {
  const walking_frame_rate = take_number(info, 'walking_frame_rate', 3);
  const running_frame_rate = take_number(info, 'running_frame_rate', 3);
  const walking_speed = take_number(info, 'walking_speed', 0);
  const walking_speedz = take_number(info, 'walking_speedz', 0);
  const running_speed = take_number(info, 'running_speed', 0);
  const running_speedz = take_number(info, 'running_speedz', 0);
  const heavy_walking_speed = take_number(info, 'heavy_walking_speed', 0);
  const heavy_walking_speedz = take_number(info, 'heavy_walking_speedz', 0);
  const heavy_running_speed = take_number(info, 'heavy_running_speed', 0);
  const heavy_running_speedz = take_number(info, 'heavy_running_speedz', 0);
  info.jump_height = info.jump_height * info.jump_height / 3.5;
  info.dash_height = info.dash_height * info.dash_height / 3.5;
  info.dash_distance /= 2;
  info.jump_distance /= 2;
  const round_trip_frames_map: any = {};
  for (const [frame_id, frame] of traversal(frames)) {
    const hit_a = take(frame, 'hit_a');
    if (hit_a) frame.hit = set_obj_field(frame.hit, 'a', { id: hit_a });
    const hit_j = take(frame, 'hit_j');
    if (hit_j) frame.hit = set_obj_field(frame.hit, 'j', { id: hit_j });
    const hit_d = take(frame, 'hit_d');
    if (hit_d) frame.hit = set_obj_field(frame.hit, 'd', { id: hit_d });

    k_9.forEach(k => {
      const h_k = `hit_${k}`;
      const next = take(frame, h_k);

      if (!is_str(next) && !is_num(next)) return;
      if (next === '0' || next === 0) return;

      if (!frame.hit) frame.hit = {};
      if (!frame.hit.sequences) frame.hit.sequences = {};
      const nf = get_next_frame_by_raw_id(next);
      if (k === 'Fa' || k === 'Fj') {
        frame.hit.sequences['L' + k[1]] = { ...nf, facing: nf.facing === FacingFlag.Backward ? FacingFlag.Right : FacingFlag.Left };
        frame.hit.sequences['R' + k[1]] = { ...nf, facing: nf.facing === FacingFlag.Backward ? FacingFlag.Right : FacingFlag.Right };
      } else {
        frame.hit.sequences[k] = nf;
      }
    });


    switch (Number(frame.id)) {
      /** standing */
      case 0: case 1: case 2: case 3: case 4: {
        frame.hit = frame.hit || {};
        frame.hold = frame.hold || {};
        frame.hit.a = [
          {
            id: '45',
            facing: FacingFlag.ByController,
            expression: Cond
              .add(ValWord.WeaponType, '==', WeaponType.Baseball)
              .or(v => v
                .add(ValWord.WeaponType, '==', WeaponType.Knife)
                .and(ValWord.PressFB, '!=', 0)
              ).done(),
          },
          {
            id: ['20', '25'],
            facing: FacingFlag.ByController,
            expression: Cond.one_of(ValWord.WeaponType, WeaponType.Knife, WeaponType.Stick).done()
          },
          {
            id: '55', expression: Cond.one_of(ValWord.WeaponType, WeaponType.Drink).done(),
            facing: FacingFlag.ByController,
          },
          { id: ['60', '65'] }
        ]; // punch
        frame.hit.j = { id: '210' }; // jump
        frame.hit.d = { id: '110' }; // defend
        frame.hit.B = frame.hold.B = { id: 'walking_0', facing: FacingFlag.Backward }; // walking
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
        frame.hit.a = [
          {
            id: ['45'],
            facing: FacingFlag.ByController,
            expression: Cond
              .add(ValWord.WeaponType, '==', WeaponType.Baseball)
              .or(v => v
                .add(ValWord.WeaponType, '==', WeaponType.Knife)
                .and(ValWord.PressFB, '!=', 0)
              ).done(),
          },
          {
            id: ['20', '25'],
            facing: FacingFlag.ByController,
            expression: Cond.one_of(ValWord.WeaponType, WeaponType.Knife, WeaponType.Stick).done()
          }, // drink
          {
            id: '55', expression: Cond.one_of(ValWord.WeaponType, WeaponType.Drink).done(),
            facing: FacingFlag.ByController,
          },
          { id: ['60', '65'] }
        ]; // punch
        frame.hit.j = { id: '210' }; // jump
        frame.hit.d = { id: '110' }; // defend
        frame.hit.FF = { id: 'running_0' };
        frame.dvx = walking_speed / 2;
        frame.dvz = walking_speedz;
        break;
      }
      /** running */
      case 9: case 10: case 11: {
        frame.hit = frame.hit || {};
        frame.hit.a = [
          { // 丢出武器
            id: ['45'],
            expression: Cond.add(ValWord.WeaponType, '==', WeaponType.Baseball)
              .or(v => v
                .add(ValWord.PressFB, '==', 1)
                .and(ValWord.WeaponType, '!=', WeaponType.None)
              )
              .done(),
          }, // drink
          {
            id: '55', expression: Cond.one_of(ValWord.WeaponType, WeaponType.Drink).done()
          },
          {
            id: '35', expression: Cond.one_of(ValWord.WeaponType, WeaponType.Knife, WeaponType.Stick).done(),
            facing: FacingFlag.ByController,
          },
          { id: '85' }
        ]; // run_atk
        frame.hit.j = { id: '213' }; // dash
        frame.hit.d = { id: '102' }; // rowing
        frame.hold = frame.hold || {};
        frame.hit.B = frame.hold.B = { id: '218' }; // running_stop
        frame.dvx = running_speed / 2;
        frame.dvz = running_speedz;
        break;
      }
      /** heavy_obj_walk */
      case 12: case 13: case 14: case 15: {
        set_hit_turn_back(frame);
        set_hold_turn_back(frame);
        frame.hit = frame.hit || {};
        frame.hit.FF = { id: 'heavy_obj_run_0' };
        frame.hit.a = { id: '50', facing: FacingFlag.ByController }; // running_stop
        frame.dvx = heavy_walking_speed / 2;
        frame.dvz = heavy_walking_speedz;
        break;
      }
      /** heavy_obj_run */
      case 16: case 17: case 18: {
        frame.hit = frame.hit || {};
        frame.hold = frame.hold || {};
        frame.hit.B = frame.hold.B = { id: '19' }; // running_stop
        frame.hit.a = { id: '50' }; // running_stop
        frame.dvx = heavy_running_speed / 2;
        frame.dvz = heavy_running_speedz;

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
      /** jump */
      case 210: case 211: case 212: {
        set_hit_turn_back(frame);
        set_hold_turn_back(frame);
        frame.hit = frame.hit || {};
        frame.hold = frame.hold || {};

        if (frame_id === '211') frame.jump_flag = 1;
        if (frame_id === '212') {
          frame.hit.a = [
            {
              id: ['52'],
              facing: FacingFlag.ByController,
              expression: Cond.one_of(
                ValWord.WeaponType, WeaponType.Baseball, WeaponType.Drink
              ).or(v => v
                .add(ValWord.PressFB, '!=', 0)
                .and(ValWord.WeaponType, '!=', WeaponType.None)
              ).done(),
            },
            {
              id: '30',
              facing: FacingFlag.ByController,
              expression: Cond.one_of(ValWord.WeaponType, WeaponType.Knife, WeaponType.Stick).done()
            },
            { id: '80', facing: FacingFlag.ByController }
          ]; // jump_atk
        }
        frame.hit.B = { facing: FacingFlag.ByController };
        frame.hold.B = { facing: FacingFlag.ByController };
        break;
      }
      /** dash */
      case 213: case 214: case 216: case 217: {
        frame.state = 5;
        if (frame_id === '213' || frame_id === '214') {
          frame.dash_flag = 1;
        }
        if (frame_id === '213' && frames[214]) set_hit_turn_back(frame, '214'); // turn back;
        if (frame_id === '216' && frames[217]) set_hit_turn_back(frame, '217'); // turn back;
        if (frame_id === '214' && frames[213]) set_hit_turn_back(frame, '213'); // turn back;
        if (frame_id === '217' && frames[216]) set_hit_turn_back(frame, '216'); // turn back;
        if (frame_id === '213' || frame_id === '216') {
          frame.hit = frame.hit || {};
          frame.hit.a = [
            {
              id: '52',
              facing: FacingFlag.ByController,
              expression: Cond.one_of(ValWord.WeaponType, WeaponType.Baseball, WeaponType.Drink).done(),
            },
            {
              id: '40',
              facing: FacingFlag.ByController,
              expression: Cond.one_of(ValWord.WeaponType, WeaponType.Knife, WeaponType.Stick).done()
            },
            { id: '90' }]; // dash_atk
        }
        break;
      }
      case 120: case 121: case 122: case 123: /** catching */
        if (frame.cpoint) {
          if (frame.cpoint.vaction) (frame.cpoint?.vaction as INextFrame).facing = FacingFlag.OpposingCatcher;
          if (frame.cpoint.injury) frame.cpoint!.shaking = 1;
          const a_action = take(frame.cpoint, 'aaction');
          const t_action = take(frame.cpoint, 'taction');
          const s_hit_a = frame.hit?.a;
          let t_hit_a: INextFrame[] | undefined;
          let a_hit_a: INextFrame | undefined;
          if (t_action) {
            t_hit_a = [
              {
                ...get_next_frame_by_raw_id(t_action),
                facing: FacingFlag.ByController,
                expression: Cond
                  .add<Defines.ValWord>(ValWord.PressFB, '!=', 0)
                  .or(ValWord.PressUD, '!=', 0)
                  .done()
              }
            ]
          }
          if (a_action)
            a_hit_a = get_next_frame_by_raw_id(a_action)

          if (Array.isArray(s_hit_a)) {
            t_hit_a && s_hit_a.unshift(...t_hit_a);
            a_hit_a && s_hit_a.unshift(a_hit_a);
          } else {
            let c = 0;
            if (s_hit_a) ++c;
            if (t_hit_a) ++c;
            if (a_hit_a) ++c;
            if (c >= 2) {
              const hit_a: INextFrame[] = [];
              s_hit_a && hit_a.push(s_hit_a);
              t_hit_a && hit_a.push(...t_hit_a);
              a_hit_a && hit_a.push(a_hit_a);
              frame.hit = frame.hit || {};
              frame.hit.a = hit_a;
            } else if (c === 1) {
              frame.hit = frame.hit || {};
              frame.hit.a = s_hit_a || t_hit_a || a_hit_a;
            }
          }
        }

        break;
      case 232: case 233: case 234:  /** throw_lying_man */
        if (frame.cpoint?.vaction) (frame.cpoint?.vaction as INextFrame).facing = FacingFlag.SameAsCatcher;
        break;

      /** crouch */
      case 215:
        const to_dash_frame: TNextFrame = [
          {
            id: '213',
            expression: Cond
              .add<Defines.ValWord>(ValWord.PressFB, '!=', 0)
              .or(ValWord.TrendX, '==', 1)
              .done(),
            facing: FacingFlag.ByController
          },
          { id: '214', expression: Cond.add(ValWord.TrendX, '==', -1).done() },
        ]; // dash
        frame.hit = frame.hit || {};
        frame.hit.d = { id: '102', facing: FacingFlag.ByController };
        frame.hit.j = to_dash_frame;
        // frame.hold = frame.hold || {};
        // frame.hold.d = { id: '102', facing: FacingFlag.ByController };
        // frame.hold.j = to_dash_frame;
        break;
    }
    switch (frame.state) {
      case State.BurnRun:
      case State.Z_Moveable:
        frame.dvz = running_speedz;
        break;
      case 1: case 2: {
        if (frame.state === 1) frame.wait = walking_frame_rate * 2;
        if (frame.state === 2) frame.wait = running_frame_rate * 2;
        round_trip_frames_map[frame.name] = round_trip_frames_map[frame.name] || [];
        round_trip_frames_map[frame.name].push(frame);
        delete frames[frame_id];
        break;
      }
      case 100: {
        frame.next = { id: '' + (Number(frame.id) + 1) };
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

  const indexes: ICharacterFrameIndexes = {
    standing: '0',
    running: "running_0",
    heavy_obj_run: "heavy_obj_run_0",
    heavy_obj_walk: ['heavy_obj_walk_0'],
    super_punch: '70',
    defend_hit: '111',
    broken_defend: '112',
    picking_light: '115',
    picking_heavy: '117',
    weapen_atk: ['20', '25'],
    jump_weapen_atk: '30',
    run_weapen_atk: '35',
    dash_weapen_atk: '40',
    l_weapen_thw: '45',
    h_weapen_thw: '50',
    air_weapon_thw: '52',
    drink: '55',
    ice: '200',
    fire: ['203', '205'],
    air_quick_rise: ['100', '108'],
    injured: {
      [-1]: '220',
      1: '222',
    },
    dizzy: '226',
    lying: {
      [-1]: '230',
      1: '231',
    },
    grand_injured: {
      [-1]: ['220'],
      1: ['222']
    },
    in_the_sky: ['212'],
    throw_enemy: '232',
    catch: ['120'],
    catch_atk: '121',
    caughts: arithmetic_progression(130, 144).map(v => '' + v),
    critical_hit: {
      [-1]: ['180'], 1: ['186']
    },
    falling: {
      [-1]: ['181', '182', '183'],
      1: ['187', '188', '189'],
    },
    bouncing: {
      [-1]: ['184', '185'],
      1: ['190', '191'],
    },
    landing_1: '215',
    landing_2: '219',
  };

  return {
    id: '',
    type: 'character',
    base: info,
    indexes,
    frames,
  };
}
