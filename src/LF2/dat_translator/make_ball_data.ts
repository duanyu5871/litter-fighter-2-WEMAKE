import { BuiltIn_OID, FacingFlag, ItrKind, StateEnum } from "../defines";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { EntityEnum } from "../defines/EntityEnum";
import { FrameBehavior } from "../defines/FrameBehavior";
import { IDatIndex } from "../defines/IDatIndex";
import { IEntityData } from "../defines/IEntityData";
import { IEntityInfo } from "../defines/IEntityInfo";
import { IFrameInfo } from "../defines/IFrameInfo";
import { OpointKind } from "../defines/OpointKind";
import { OpointMultiEnum } from "../defines/OpointMultiEnum";
import { SpeedMode } from "../defines/SpeedMode";
import { traversal } from "../utils/container_help/traversal";
import { to_num } from "../utils/type_cast/to_num";
import { CondMaker } from "./CondMaker";
import { cook_ball_frame_state_3000 } from "./cook_ball_frame_state_3000";
import { cook_ball_frame_state_3005 } from "./cook_ball_frame_state_3005";
import { cook_ball_frame_state_3006 } from "./cook_ball_frame_state_3006";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take, take_str } from "./take";

export function make_ball_data(
  info: IEntityInfo,
  frames: Record<string, IFrameInfo>,
  datIndex: IDatIndex,
): IEntityData {
  info.hp = 500;

  let weapon_broken_sound = take_str(info, "weapon_broken_sound");
  if (weapon_broken_sound) {
    weapon_broken_sound += ".mp3";
    info.dead_sounds = [weapon_broken_sound];
  }

  let weapon_drop_sound = take_str(info, "weapon_drop_sound");
  if (weapon_drop_sound) {
    weapon_drop_sound += ".mp3";
    info.drop_sounds = [weapon_drop_sound];
  }

  let weapon_hit_sound = take_str(info, "weapon_hit_sound");
  if (weapon_hit_sound) {
    weapon_hit_sound += ".mp3";
    info.hit_sounds = [weapon_hit_sound];
  }

  for (const [, frame] of traversal(frames)) {
    const hit_j = take(frame, "hit_j");
    if (hit_j !== 0) frame.dvz = to_num(hit_j, 50) - 50;

    const hit_a = take(frame, "hit_a");
    if (hit_a) frame.hp = hit_a / 2;

    const hit_d = take(frame, "hit_d");
    if (hit_d && hit_d !== frame.id)
      frame.on_dead = get_next_frame_by_raw_id(hit_d);

    const hit_Fa = take(frame, "hit_Fa");
    if (hit_Fa) frame.behavior = hit_Fa;

    switch (hit_Fa as FrameBehavior) {
      case FrameBehavior._01:
        frame.ctrl_spd_x = 5;
        frame.ctrl_acc_x = 0.1;
        frame.ctrl_spd_x_m = SpeedMode.AccTo;
        frame.ctrl_spd_z = 5;
        frame.ctrl_acc_z = 0.2;
        frame.ctrl_spd_z_m = SpeedMode.AccTo;
        frame.ctrl_spd_y = 1;
        frame.ctrl_acc_y = 0.01;
        frame.ctrl_spd_y_m = SpeedMode.AccTo;
        break;
      case FrameBehavior._02:
        frame.ctrl_spd_x = 5;
        frame.ctrl_acc_x = 0.1;
        frame.ctrl_spd_x_m = SpeedMode.AccTo;
        frame.ctrl_spd_z = 5;
        frame.ctrl_acc_z = 0.2;
        frame.ctrl_spd_z_m = SpeedMode.AccTo;
        frame.ctrl_spd_y = 1;
        frame.ctrl_acc_y = 0.01;
        frame.ctrl_spd_y_m = SpeedMode.AccTo;
        frame.on_dead = { id: '5' }
        break;
      case FrameBehavior._03:
        break;
      case FrameBehavior._04:
        break;
      case FrameBehavior._05:
        jan_chaseh_start(frame);
        break;
      case FrameBehavior._06:
        jan_chase_start(frame);
        break;
      case FrameBehavior._07:
        frame.ctrl_spd_x = 5;
        frame.ctrl_acc_x = 0.1;
        frame.ctrl_spd_x_m = SpeedMode.AccTo;
        frame.ctrl_spd_z = 5;
        frame.ctrl_acc_z = 0.2;
        frame.ctrl_spd_z_m = SpeedMode.AccTo;
        frame.ctrl_spd_y = 1;
        frame.ctrl_acc_y = 0.01;
        frame.ctrl_spd_y_m = SpeedMode.AccTo;
        frame.dvy = -6;
        frame.acc_y = -0.25;
        frame.vym = SpeedMode.AccTo;
        switch (datIndex.id) {
          case BuiltIn_OID.FirzenChasef:
          case BuiltIn_OID.FirzenChasei:
            frame.on_hit_ground = { id: "60" };
            break;
          case BuiltIn_OID.JanChase:
            frame.on_hit_ground = { id: "10" };
            break;
        }
        break;
      case FrameBehavior.BatStart:
      case FrameBehavior._08:
        frame.opoint = frame.opoint || [];
        frame.opoint.push({
          kind: OpointKind.Normal,
          oid: BuiltIn_OID.BatChase,
          x: frame.centerx,
          y: frame.centery,
          action: { id: "0" },
          multi: {
            type: OpointMultiEnum.AccordingEnemies,
            min: 3,
          },
        });
        break;
      case FrameBehavior.FirzenDisasterStart:
      case FrameBehavior._09:
        firzen_disater_start(frame);
        break;
      case FrameBehavior._10:
        frame.dvx = 15;
        frame.acc_x = 2;
        frame.vxm = SpeedMode.AccTo;
        break;
      case FrameBehavior.FirzenVolcanoStart:
      case FrameBehavior._11:
        firzen_disater_start(frame, frame.centerx, -79);
        frame.opoint = frame.opoint || [];
        frame.opoint.push({
          kind: OpointKind.Normal,
          oid: BuiltIn_OID.FirenFlame,
          x: frame.centerx,
          y: 26,
          action: { id: "109" },
        }, {
          kind: OpointKind.Normal,
          oid: BuiltIn_OID.FreezeColumn,
          x: 135,
          y: 26,
          action: { id: "100" },
        }, {
          kind: OpointKind.Normal,
          oid: BuiltIn_OID.FreezeColumn,
          x: -45,
          y: 26,
          action: { id: "100", facing: FacingFlag.Backward },
        });
        break;
      case FrameBehavior.Bat:
      case FrameBehavior._12:
        frame.ctrl_spd_x = 5;
        frame.ctrl_acc_x = 0.1;
        frame.ctrl_spd_x_m = SpeedMode.AccTo;
        frame.ctrl_spd_z = 5;
        frame.ctrl_acc_z = 0.2;
        frame.ctrl_spd_z_m = SpeedMode.AccTo;
        frame.ctrl_spd_y = 1;
        frame.ctrl_acc_y = 0.01;
        frame.ctrl_spd_y_m = SpeedMode.AccTo;
        break;
      case FrameBehavior.JulianBallStart:
      case FrameBehavior._13:
        frame.opoint = frame.opoint || [];
        frame.opoint.push({
          kind: OpointKind.Normal,
          oid: BuiltIn_OID.JulianBall,
          x: frame.centerx,
          y: frame.centery,
          dvx: 8,
          action: { id: "50" },
        });
        break;
      case FrameBehavior.JulianBall:
      case FrameBehavior._14:
        frame.ctrl_spd_x = 5;
        frame.ctrl_acc_x = 0.1;
        frame.ctrl_spd_x_m = SpeedMode.AccTo;
        frame.ctrl_spd_z = 3;
        frame.ctrl_acc_z = 0.1;
        frame.ctrl_spd_z_m = SpeedMode.AccTo;
        frame.ctrl_spd_y = 1;
        frame.ctrl_acc_y = 0.01;
        frame.ctrl_spd_y_m = SpeedMode.AccTo;
        break;
    }
    if (frame.itr) {
      for (const itr of frame.itr) {
        if (itr.kind === ItrKind.JohnShield) {
          if (hit_d) {
            itr.actions = itr.actions || [];
            itr.actions.push({
              type: 'next_frame',
              test: new CondMaker<C_Val>()
                .add(C_Val.VictimType, "==", EntityEnum.Character)
                .done(),
              data: { id: hit_d }
            })
          }
        }
        if (
          weapon_hit_sound &&
          itr.kind !== ItrKind.Whirlwind &&
          itr.kind !== ItrKind.Freeze &&
          itr.kind !== ItrKind.Block
        ) {
          itr.actions = itr.actions || [];
          itr.actions.push({ type: 'sound', path: [weapon_hit_sound] })
        }
      }
    }
  }
  const ret: IEntityData = {
    id: datIndex.id,
    type: EntityEnum.Ball,
    base: info,
    frames: frames,
  };

  traversal(ret.frames, (_, frame) => {
    switch (frame.state) {
      case StateEnum._3000:
        return cook_ball_frame_state_3000(ret, frame);
      case StateEnum._3002:
        return cook_ball_frame_state_3000(ret, frame);
      case StateEnum._3005:
        return cook_ball_frame_state_3005(ret, frame);
      case StateEnum._3006:
        return cook_ball_frame_state_3006(ret, frame);
    }
  });
  return ret;
}

function firzen_disater_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  frame.opoint = frame.opoint || [];
  frame.opoint.push({
    kind: OpointKind.Normal,
    oid: [
      BuiltIn_OID.FirzenChasef,
      BuiltIn_OID.FirzenChasei
    ],
    x,
    y,
    dvy: 6,
    action: { id: "0" },
    multi: { type: OpointMultiEnum.AccordingEnemies, min: 4 },
  });
}
function jan_chaseh_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  frame.opoint = frame.opoint || [];
  frame.opoint.push({
    kind: OpointKind.Normal,
    oid: BuiltIn_OID.JanChaseh,
    x,
    y,
    action: { id: "0" },
    multi: { type: OpointMultiEnum.AccordingAllies, min: 1 },
  });
}
function jan_chase_start(frame: IFrameInfo, x: number = frame.centerx, y: number = frame.centery) {
  frame.opoint = frame.opoint || [];
  frame.opoint.push({
    kind: OpointKind.Normal,
    oid: BuiltIn_OID.JanChase,
    x, y, dvy: 6,
    action: { id: "0" },
    multi: { type: OpointMultiEnum.AccordingEnemies, min: 1 },
  });
}