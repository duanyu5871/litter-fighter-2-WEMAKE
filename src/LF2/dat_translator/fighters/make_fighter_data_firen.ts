import { BotVal, BuiltIn_OID, Defines, GameKey as GK, HitFlag, IEntityData, ItrKind } from "../../defines";
import { ActionType } from "../../defines/ActionType";
import { CollisionVal as C_Val } from "../../defines/CollisionVal";
import { arithmetic_progression, ensure } from "../../utils";
import { CondMaker } from "../CondMaker";
import { bot_ball_continuation } from "./bot_ball_continuation";
import { bot_ball_dfa } from "./bot_ball_dfa";
import { bot_ball_dfj } from "./bot_ball_dfj";
import { bot_explosion_duj } from "./bot_explosion_duj";
import { BotBuilder } from "./BotBuilder";
import { frames } from "./frames";

/**
 *
 * @export
 * @param {IEntityData} data
 * @return {*} 
 */
export function make_fighter_data_firen(data: IEntityData) {
  [
    data.frames["running_0"],
    data.frames["running_1"],
    data.frames["running_2"],
    data.frames["running_3"]
  ].filter(Boolean).map(frame => {
    frame.itr = ensure(frame.itr, {
      hit_flag: HitFlag.Fighter | HitFlag.Ally,
      kind: ItrKind.Block,
      z: -Defines.DAFUALT_QUBE_LENGTH / 2,
      l: Defines.DAFUALT_QUBE_LENGTH,
      x: 25,
      y: 19,
      w: 38,
      h: 60,
      actions: [{
        type: ActionType.FUSION,
        data: {
          oid: BuiltIn_OID.Firzen,
          // act
        }
      }],
      test: new CondMaker<C_Val>()
        .add(C_Val.VictimOID, '==', BuiltIn_OID.Freeze)
        .and(C_Val.SameFacing, '==', 0)
        .and(c => c
          .add(C_Val.V_HP_P, '<=', 33)
          .and(C_Val.A_HP_P, '<', 33)
          .or(C_Val.LF2_NET_ON, '==', 1)
        )
        .done()
    })
  })


  BotBuilder.make(data).set_actions(
    // d>a
    bot_ball_dfa(75, void 0, 50),

    // d>a+a
    bot_ball_continuation("d>a+a", 0.8, 75),

    // d>j
    bot_ball_dfj(75, void 0, 50, 1000)(e => {
      e.e_ray?.push(
        { ...e.e_ray![0], z: 0.2 },
        { ...e.e_ray![0], z: -0.2 }
      );
      return e;
    }),

    // cancel_d>j
    bot_ball_dfj(0, void 0, 0, 1000)((action, cond) => {
      action.action_id = 'cancel_d>j'
      const ray = action.e_ray![0]
      ray.reverse = true
      action.e_ray?.push(
        { ...ray, z: 0.2 },
        { ...ray, z: -0.2 }
      );
      action.expression = cond.or(BotVal.EnemyDiffX, "<", -100).done();
      action.keys = [GK.Jump]
      return action;
    }),

    // dvj
    bot_ball_dfj(75, void 0, 50, 200)(action => {
      action.action_id = 'dvj'
      action.e_ray?.push(
        { ...action.e_ray![0], z: 0.05 },
        { ...action.e_ray![0], z: -0.1 }
      );
      action.keys = [GK.Defend, GK.Down, GK.Jump]
      return action;
    }),

    // cancel_dvj
    bot_ball_dfj(0, void 0, 50, 200)((action) => {
      action.action_id = 'cancel_dvj'
      const ray = action.e_ray![0]
      ray.reverse = true
      action.e_ray?.push(
        { ...ray, z: 0.05 },
        { ...ray, z: -0.05 }
      );
      action.keys = [GK.Jump]
      return action;
    }),

    // d^j
    bot_explosion_duj(300, 1 / 60, -110, 110, 900),

  ).set_frames(
    [
      ...frames.standings,
      ...frames.walkings
    ],
    ['d>a', 'd>j', 'd^j', 'dvj']
  ).set_frames(
    arithmetic_progression(255, 261),
    ["cancel_d>j"]
  ).set_frames(
    arithmetic_progression(267, 275),
    ["cancel_dvj"]
  ).set_frames(
    arithmetic_progression(235, 252),
    ["d>a+a"]
  );
  return data;
}
