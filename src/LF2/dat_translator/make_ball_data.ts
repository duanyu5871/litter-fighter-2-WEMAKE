import { ItrKind } from "../defines";
import { IEntityData } from "../defines/IEntityData";
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
import { FrameBehavior } from "../defines/FrameBehavior";
import { OpointMultiEnum } from "../defines/OpointMultiEnum";
import { SpeedMode } from "../defines/SpeedMode";

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
    if (hit_Fa) frame.behavior = hit_Fa;
    switch (hit_Fa as FrameBehavior) {
      case FrameBehavior._01:
      case FrameBehavior._02:
      case FrameBehavior._03:
      case FrameBehavior._04:
      case FrameBehavior._05:
      case FrameBehavior._06:
        break;
      case FrameBehavior._07:
        frame.dvy = -4;
        frame.acc_y = -0.1;
        frame.vym = SpeedMode.AccToSpeed;
        switch (datIndex.id) {
          case Defines.BuiltIn_OID.Firzen_chasef:
          case Defines.BuiltIn_OID.Firzen_chasei:
            frame.on_hit_ground = { id: "60" }
            break;
          case Defines.BuiltIn_OID.Jan_chaseh:
            frame.on_hit_ground = { id: "10" }
            break;
        }
        break;
      case FrameBehavior.BatStart:
      case FrameBehavior._08:
        frame.opoint = frame.opoint || []
        frame.opoint.push({
          kind: OpointKind.Normal,
          oid: Defines.BuiltIn_OID.Bat_chase,
          x: frame.centerx,
          y: frame.centery,
          action: { id: '0' },
          multi: 3
        })
        break;
      case FrameBehavior.FirzenDisasterStart:
      case FrameBehavior._09:
        frame.opoint = frame.opoint || []
        frame.opoint.push({
          kind: OpointKind.Normal,
          oid: [
            Defines.BuiltIn_OID.Firzen_chasef,
            Defines.BuiltIn_OID.Firzen_chasei,
          ],
          x: frame.centerx,
          y: frame.centery,
          dvy: 4,
          action: { id: '0' },
          multi: { type: OpointMultiEnum.AccordingEnemies, min: 4 }
        })
        break;
      case FrameBehavior._10:
      case FrameBehavior._11:
      case FrameBehavior._12:
        break;
      case FrameBehavior.JulianBallStart:
      case FrameBehavior._13:
        frame.opoint = frame.opoint || []
        frame.opoint.push({
          kind: OpointKind.Normal,
          oid: Defines.BuiltIn_OID.Julian_ball,
          x: frame.centerx,
          y: frame.centery,
          action: { id: '50' }
        })
        break;
      case FrameBehavior.JulianBall:
      case FrameBehavior._14:
        break;
    }
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
          itr.kind !== ItrKind.Whirlwind &&
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
      case Defines.State._3002:
        return cook_ball_frame_state_3000(ret, frame);
      case Defines.State._3005:
        return cook_ball_frame_state_3005(ret, frame);
      case Defines.State._3006:
        return cook_ball_frame_state_3006(ret, frame);
    }

  })
  return ret
}


