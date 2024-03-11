import { arithmetic_progression } from '../arithmetic_progression';
import { take_number } from '../as_number';
import { is_num } from '../is_num';
import { is_str } from '../is_str';
import { ICharacterData, ICharacterFrameInfo, INextFrame, TNextFrame } from '../lf2_type';
import { ICharacterFrameIndexes } from "../lf2_type/ICharacterFrameIndexes";
import { ICharacterInfo } from "../lf2_type/ICharacterInfo";
import { IFrameInfo } from "../lf2_type/IFrameInfo";
import { Defines } from '../lf2_type/defines';
import { set_obj_field } from '../set_obj_field';
import { traversal } from '../traversal';
import { get_next_frame_by_id } from './get_the_next';
import { take } from './take';
const k_9 = [
  'Fa', 'Fj',
  'Da', 'Dj',
  'Ua', 'Uj', 'ja'
] as const;

// const CONDITION_HOLDING_WEAPON_STICK = `weapon_type == ${Defines.WeaponType.Stick}`;
// const CONDITION_PRESS_F = 'press_F_B == 1'

class Cond {
  static readonly get = () => new Cond();
  static readonly bracket: Cond['bracket'] = (...args) => this.get().bracket(...args);
  static readonly weapon_is: Cond['weapon_is'] = (...args) => this.get().weapon_is(...args);
  static readonly weapon_not: Cond['weapon_not'] = (...args) => this.get().weapon_not(...args);
  static readonly press_F_B: Cond['press_F_B'] = (...args) => this.get().press_F_B(...args);
  static readonly press_F: Cond['press_F'] = (...args) => this.get().press_F(...args);
  static readonly press_B: Cond['press_B'] = (...args) => this.get().press_B(...args);
  static readonly press_F_B_not: Cond['press_F_B_not'] = (...args) => this.get().press_F_B_not(...args);
  static readonly not_press_F: Cond['not_press_F'] = (...args) => this.get().not_press_F(...args);
  static readonly not_press_B: Cond['not_press_B'] = (...args) => this.get().not_press_B(...args);
  static readonly press_U_D: Cond['press_U_D'] = (...args) => this.get().press_U_D(...args);
  static readonly press_U: Cond['press_U'] = (...args) => this.get().press_U(...args);
  static readonly press_D: Cond['press_D'] = (...args) => this.get().press_D(...args);
  static readonly press_U_D_not: Cond['press_U_D_not'] = (...args) => this.get().press_U_D_not(...args);
  static readonly not_press_U: Cond['not_press_U'] = (...args) => this.get().not_press_U(...args);
  static readonly not_press_D: Cond['not_press_D'] = (...args) => this.get().not_press_D(...args);

  private _parts: (string | Cond)[] = [];
  or(): this {
    this._parts.push('|')
    return this;
  }
  and(): this {
    this._parts.push('&')
    return this;
  }
  bracket(func: (c: Cond) => Cond): this {
    this._parts.push(func(Cond.get()))
    return this;
  }
  weapon_is(v: Defines.WeaponType): this {
    this._parts.push(`weapon_type==${v}`)
    return this;
  }
  weapon_not(v: Defines.WeaponType): this {
    this._parts.push(`weapon_type!=${v}`)
    return this;
  }
  press_F_B(v: -1 | 0 | 1 = 0): this { this._parts.push(`press_F_B == ${v}`); return this; }
  readonly press_F = () => this.press_F_B(1);
  readonly press_B = () => this.press_F_B(-1);

  press_F_B_not(v: -1 | 0 | 1 = 0): this { this._parts.push(`press_F_B != ${v}`); return this; }
  readonly not_press_F = () => this.press_F_B_not(1);
  readonly not_press_B = () => this.press_F_B_not(-1);

  press_U_D(v: -1 | 0 | 1 = 0): this { this._parts.push(`press_U_D == ${v}`); return this; }
  readonly press_U = () => this.press_U_D(1);
  readonly press_D = () => this.press_U_D(-1);

  press_U_D_not(v: -1 | 0 | 1 = 0): this { this._parts.push(`press_U_D != ${v}`); return this; }
  readonly not_press_U = () => this.press_U_D_not(1);
  readonly not_press_D = () => this.press_U_D_not(-1);

  done(): string {
    return this._parts.map(v => is_str(v) ? v : `(${v.done()})`).join('').replace(/\s/g, '');
  }
}

const set_hit_turn_back = (frame: IFrameInfo, back_frame_id: string = '') => {
  frame.hit = frame.hit || {}
  frame.hit.B = { id: back_frame_id, wait: 'i', facing: Defines.FacingFlag.Backward }
}
const set_hold_turn_back = (frame: IFrameInfo, back_frame_id: string = '') => {
  frame.hold = frame.hold || {}
  frame.hold.B = { id: back_frame_id, wait: 'i', facing: Defines.FacingFlag.Backward }
}
export function make_character_data(info: ICharacterInfo, frames: Record<string, ICharacterFrameInfo>): ICharacterData {
  const walking_frame_rate = take_number(info, 'walking_frame_rate', 3);
  const running_frame_rate = take_number(info, 'running_frame_rate', 3);
  const walking_speed = take_number(info, 'walking_speed', 0);
  const walking_speedz = take_number(info, 'walking_speedz', 0);
  const running_speed = take_number(info, 'running_speed', 0);
  const running_speedz = take_number(info, 'running_speedz', 0);

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
      const nf = get_next_frame_by_id(next);
      if (k === 'Fa' || k === 'Fj') {
        frame.hit.sequences['L' + k[1]] = { ...nf, facing: nf.facing === Defines.FacingFlag.Backward ? Defines.FacingFlag.Right : Defines.FacingFlag.Left };
        frame.hit.sequences['R' + k[1]] = { ...nf, facing: nf.facing === Defines.FacingFlag.Backward ? Defines.FacingFlag.Right : Defines.FacingFlag.Right };
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
            id: ['45'],
            facing: Defines.FacingFlag.ByController,
            condition: Cond
              .weapon_is(Defines.WeaponType.Baseball).or()
              .bracket(v =>
                v.weapon_is(Defines.WeaponType.Knife)
                  .and().press_F_B_not(0)
              ).done(),
          },
          {
            id: ['20', '25'],
            facing: Defines.FacingFlag.ByController,
            condition: Cond
              .weapon_is(Defines.WeaponType.Knife).or()
              .weapon_is(Defines.WeaponType.Stick).done()
          },
          { id: ['60', '65'] }
        ]; // punch
        frame.hit.j = { id: '210' }; // jump
        frame.hit.d = { id: '110' }; // defend
        frame.hit.B = frame.hold.B = { id: 'walking_0', facing: Defines.FacingFlag.Backward }; // walking
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
            facing: Defines.FacingFlag.ByController,
            condition: Cond
              .weapon_is(Defines.WeaponType.Baseball).or()
              .bracket(v =>
                v.weapon_is(Defines.WeaponType.Knife).and()
                  .press_F_B_not(0)
              ).done(),
          },
          {
            id: ['20', '25'],
            facing: Defines.FacingFlag.ByController,
            condition: Cond
              .weapon_is(Defines.WeaponType.Knife).or()
              .weapon_is(Defines.WeaponType.Stick).done()
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
          {
            id: ['45'],
            condition: Cond
              .weapon_is(Defines.WeaponType.Baseball).or().bracket(v => v
                .press_F().and().weapon_not(Defines.WeaponType.None)
              )
              .done(),
          }, // 丢出武器
          {
            id: '35', condition: Cond
              .weapon_is(Defines.WeaponType.Knife).or()
              .weapon_is(Defines.WeaponType.Stick).done()
          },
          { id: '85' }
        ]; // run_atk
        frame.hit.j = { id: '213' }; // dash
        frame.hit.d = { id: '102' }; // rowing
        frame.hold = frame.hold || {};
        frame.hit.B = frame.hold.B = { id: '218' }; // running_stop
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
        frame.hit.B = frame.hold.B = { id: '19' }; // running_stop
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
              facing: Defines.FacingFlag.ByController,
              condition: Cond
                .weapon_is(Defines.WeaponType.Baseball).or()
                .weapon_is(Defines.WeaponType.Drink).or().bracket(v => v
                  .press_F_B_not(0).and()
                  .weapon_not(Defines.WeaponType.None)
                )
                .done(),
            },
            {
              id: '30',
              facing: Defines.FacingFlag.ByController,
              condition: Cond
                .weapon_is(Defines.WeaponType.Knife).or()
                .weapon_is(Defines.WeaponType.Stick).done()
            },
            { id: '80', facing: Defines.FacingFlag.ByController }
          ]; // jump_atk
        }
        frame.hit.B = { facing: Defines.FacingFlag.ByController };
        frame.hold.B = { facing: Defines.FacingFlag.ByController };
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
              facing: Defines.FacingFlag.ByController,
              condition: Cond
                .weapon_is(Defines.WeaponType.Baseball).or()
                .weapon_is(Defines.WeaponType.Drink)
                .done(),
            },
            {
              id: '40',
              facing: Defines.FacingFlag.ByController,
              condition: Cond
                .weapon_is(Defines.WeaponType.Knife).or()
                .weapon_is(Defines.WeaponType.Stick).done()
            },
            { id: '90' }]; // dash_atk
        }
        break;
      }
      case 120: case 121: case 122: case 123: /** catching */
        if (frame.cpoint) {
          if (frame.cpoint.vaction) (frame.cpoint?.vaction as INextFrame).facing = Defines.FacingFlag.OpposingCatcher;
          if (frame.cpoint.injury) frame.cpoint!.shaking = 1;
          const a_action = take(frame.cpoint, 'aaction');
          const t_action = take(frame.cpoint, 'taction');
          const s_hit_a = frame.hit?.a;
          let t_hit_a: INextFrame[] | undefined;
          let a_hit_a: INextFrame | undefined;
          if (t_action) {
            t_hit_a = [
              {
                ...get_next_frame_by_id(t_action),
                facing: Defines.FacingFlag.ByController,
                condition: Cond
                  .press_F_B_not(0).or()
                  .press_U_D_not(0).done()
              }
            ]
          }
          if (a_action)
            a_hit_a = get_next_frame_by_id(a_action)

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
        if (frame.cpoint?.vaction) (frame.cpoint?.vaction as INextFrame).facing = Defines.FacingFlag.SameAsCatcher;
        break;

      /** crouch */
      case 215:
        const to_dash_frame: TNextFrame = [
          { id: '213', condition: 'press_F_B != 0|trend_x == 1', facing: Defines.FacingFlag.ByController },
          { id: '214', condition: 'trend_x == -1' },
        ]; // dash
        frame.hit = frame.hit || {};
        frame.hit.d = { id: '102', facing: Defines.FacingFlag.ByController };
        frame.hit.j = to_dash_frame;
        frame.hold = frame.hold || {};
        frame.hold.d = { id: '102', facing: Defines.FacingFlag.ByController };
        frame.hold.j = to_dash_frame;
        break;
    }
    switch (frame.state) {
      case Defines.State.BurnRun:
      case Defines.State.Z_Moveable:
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
