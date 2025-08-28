import {
  FacingFlag,
  IBdyInfo,
  ICpointInfo,
  IFramePictureInfo,
  IItrInfo,
  IOpointInfo,
  ItrKind,
  IWpointInfo,
  StateEnum,
} from "../defines";
import { AllyFlag } from "../defines/AllyFlag";
import { BdyKind } from "../defines/BdyKind";
import { CollisionVal as C_Val } from "../defines/CollisionVal";
import { IEntityInfo } from "../defines/IEntityInfo";
import { IFrameInfo } from "../defines/IFrameInfo";
import { ILegacyPictureInfo } from "../defines/ILegacyPictureInfo";
import { OpointKind } from "../defines/OpointKind";
import { SpeedMode } from "../defines/SpeedMode";
import { Defines } from "../defines/defines";
import { ensure } from "../utils";
import { abs, floor } from "../utils/math/base";
import { match_all } from "../utils/string_parser/match_all";
import { match_colon_value } from "../utils/string_parser/match_colon_value";
import take_sections from "../utils/string_parser/take_sections";
import { to_num } from "../utils/type_cast/to_num";
import { not_zero_num } from "../utils/type_check";
import { CondMaker } from "./CondMaker";
import cook_bdy from "./cook_bdy";
import { cook_cpoint } from "./cook_cpoint";
import { cook_itr } from "./cook_itr";
import cook_opoint from "./cook_opoint";
import { cook_wpoint } from "./cook_wpoint";
import { add_next_frame } from "./edit_next_frame";
import { get_next_frame_by_raw_id } from "./get_the_next";
import { take } from "./take";
export function make_frames(
  text: string,
  files: IEntityInfo["files"],
): Record<string, IFrameInfo> {
  const frames: Record<string, IFrameInfo> = {};
  const frame_regexp = /<frame>\s+(.*?)\s+(.*)((.|\n)+?)<frame_end>/g;
  for (const [, frame_id, frame_name, content] of match_all(
    text,
    frame_regexp,
  )) {
    let _content = content;
    const r1 = take_sections<IBdyInfo>(_content, "bdy:", "bdy_end:");
    const bdy_list = r1.sections;
    _content = r1.remains;

    for (const bdy of bdy_list) cook_bdy(bdy);

    const r2 = take_sections<IItrInfo>(_content, "itr:", "itr_end:");
    const itr_list = r2.sections;
    _content = r2.remains;

    for (const itr of itr_list) cook_itr(itr);

    const r3 = take_sections<IOpointInfo>(_content, "opoint:", "opoint_end:");
    const opoint_list = r3.sections;
    _content = r3.remains;
    for (const opoint of opoint_list) cook_opoint(opoint);

    const r4 = take_sections<IWpointInfo>(_content, "wpoint:", "wpoint_end:");
    const wpoint_list = r4.sections;
    _content = r4.remains;
    for (const wpoint of wpoint_list) cook_wpoint(wpoint);

    const r5 = take_sections(_content, "bpoint:", "bpoint_end:");
    const bpoint_list = r5.sections;
    _content = r5.remains;

    const r6 = take_sections<ICpointInfo>(_content, "cpoint:", "cpoint_end:");
    const cpoint_list = r6.sections;
    _content = r6.remains;
    for (const cpoint of cpoint_list) cook_cpoint(cpoint);

    const fields: any = {};
    for (const [name, value] of match_colon_value(_content))
      fields[name] = to_num(value) ?? value;

    const raw_next = take(fields, "next");
    const next = get_next_frame_by_raw_id(raw_next);
    const pic_idx = take(fields, "pic");
    let frame_pic_info: IFramePictureInfo | undefined = void 0;
    let entity_pic_info: ILegacyPictureInfo | undefined = void 0;

    let pic = pic_idx;
    for (const key in files) {
      const { row, col } = (entity_pic_info = files[key] as ILegacyPictureInfo);
      if (pic < row * col) break;
      pic -= row * col;
    }

    let error: any;
    if (entity_pic_info) {
      const { id, row, cell_w, cell_h } = entity_pic_info;
      frame_pic_info = {
        tex: id,
        x: (cell_w + 1) * (pic % row),
        y: (cell_h + 1) * floor(pic / row),
        w: cell_w,
        h: cell_h,
      };
    } else {
      error = {
        msg: "entity_pic_info not found!",
        files,
        pic_idx,
      };
    }

    const wait = take(fields, "wait") * 2 + 1;
    const frame: IFrameInfo = {
      id: frame_id,
      name: frame_name,
      pic: frame_pic_info,
      wait,
      next,
      ...fields,
      bdy: bdy_list,
      itr: itr_list,
      wpoint: wpoint_list[0],
      bpoint: bpoint_list[0],
      opoint: opoint_list,
      cpoint: cpoint_list[0],
    };
    const state_name = StateEnum[frame.state!]
    if (state_name) (frame as any).state_name = `StateEnum.${state_name}`

    if (error) (frame as any).__ERROR__ = error;
    if (
      (raw_next >= 1100 && raw_next <= 1299) ||
      (raw_next <= -1100 && raw_next >= -1299)
    ) {
      frame.invisible = 2 * (abs(raw_next) - 1100);
    }

    if (!frame.itr?.length) delete frame.itr;
    if (!frame.bdy?.length) delete frame.bdy;
    if (!frame.opoint?.length) delete frame.opoint;
    if (!frame.wpoint) delete frame.wpoint;
    if (!frame.bpoint) delete frame.bpoint;
    if (!frame.cpoint) delete frame.cpoint;

    const sound = take(frame, "sound");
    if (sound) frame.sound = sound + ".mp3";
    frames[frame_id] = frame;

    const dircontrol = take(cpoint_list[0], "dircontrol");
    if (dircontrol) {
      frame.hit = frame.hit || {};
      if (dircontrol === 1) {
        frame.hit.B = add_next_frame(frame.hit.B, {
          wait: "i",
          facing: FacingFlag.Backward,
        });
      } else {
        frame.hit.F = add_next_frame(frame.hit.F, {
          wait: "i",
          facing: FacingFlag.Backward,
        });
      }
    }

    const dvx = take(frame, "dvx");
    if (dvx === 550) frame.dvx = dvx;
    else if (not_zero_num(dvx)) {
      if (dvx >= 501 && dvx <= 549) {
        frame.dvx = Number(((dvx - 550) * 0.5).toPrecision(1));
        frame.vxm = SpeedMode.FixedLf2;
      } else if (dvx >= 551) {
        frame.dvx = Number(((dvx - 550) * 0.5).toPrecision(1));
        frame.vxm = SpeedMode.FixedLf2;
      } else {
        frame.dvx = Number((dvx * 0.5).toPrecision(1));
      }
    }
    if (
      frame.state === StateEnum.Attacking ||
      frame.state === StateEnum.Rowing
    ) {
      const dvz = take(frame, "dvz");
      if (dvz === 550) frame.dvz = dvz;
      else if (not_zero_num(dvz)) {
        if (dvz >= 501 && dvz <= 549) {
          frame.dvz = dvz - 550;
          frame.vzm = SpeedMode.FixedLf2;
        } else if (dvz >= 551) {
          frame.dvz = dvz - 550;
          frame.vzm = SpeedMode.FixedLf2;
        } else {
          frame.ctrl_spd_z = dvz;
        }
      }
    } else {
      const dvz = take(frame, "dvz");
      if (dvz === 550) frame.dvz = dvz;
      else if (not_zero_num(dvz)) {
        if (dvz >= 501 && dvz <= 549) {
          frame.dvz = (dvz - 550) * 0.5;
          frame.vzm = SpeedMode.FixedLf2;
        } else if (dvz >= 551) {
          frame.dvz = (dvz - 550) * 0.5;
          frame.vzm = SpeedMode.FixedLf2;
        } else {
          frame.dvz = dvz * 0.5;
        }
      }
    }

    const dvy = take(frame, "dvy");
    if (dvy === 550) frame.dvy = dvy;
    else if (not_zero_num(dvy)) {
      if (dvy >= 501 && dvy <= 549) {
        frame.dvy = (dvy - 550) * -0.285;
        frame.vym = SpeedMode.FixedLf2;
      } else if (dvy >= 551) {
        frame.dvy = (dvy - 550) * -0.285;
        frame.vym = SpeedMode.FixedLf2;
      } else {
        frame.dvy = dvy * -0.285;
      }
    }

    switch (frame.state) {
      case StateEnum.Ball_3005:
        frame.no_shadow = 1;
        break;
      case StateEnum.HeavyWeapon_OnHand:
        frame.no_shadow = 1;
        break;
      case StateEnum.Weapon_OnHand:
        frame.no_shadow = 1;
        break;
      case StateEnum.Burning: {
        if (frame.itr) {
          for (const itr of frame.itr) {
            itr.ally_flags = AllyFlag.Both;
          }
        }
        break;
      }
      case StateEnum.LouisCastOff:

        frame.opoint = ensure(frame.opoint,
          {
            kind: OpointKind.Normal,
            x: 39,
            y: 79,
            oid: "218",
            dvy: 5,
            action: { id: "auto" },
          },
          {
            kind: OpointKind.Normal,
            x: 39,
            y: 79,
            oid: "217",
            dvy: 4,
            dvx: 8,
            action: { id: "auto", facing: FacingFlag.Backward },
            multi: 2,
          },
          {
            kind: OpointKind.Normal,
            x: 39,
            y: 79,
            oid: "217",
            dvy: 4,
            dvx: 8,
            action: { id: "auto" },
            multi: 2,
          },
        );
        break;
      case StateEnum.Falling:
        if (frame.bdy)
          for (const bdy of frame.bdy) {
            if (bdy.kind === BdyKind.Normal) {
              bdy.test = new CondMaker<C_Val>()
                .add(
                  C_Val.ItrFall,
                  ">=",
                  Defines.DEFAULT_FALL_VALUE_MAX -
                  Defines.DEFAULT_FALL_VALUE_DIZZY,
                )
                .or(C_Val.ItrKind, "==", ItrKind.MagicFlute)
                .or(C_Val.ItrKind, "==", ItrKind.MagicFlute2)
                .done();
            }
          }
        break;
    }
    if (frame.itr) {
      for (const itr of frame.itr) {
        if (
          itr.kind === ItrKind.SuperPunchMe &&
          (!itr.vrest || itr.vrest < frame.wait)
        ) {
          itr.vrest = frame.wait;
        }
      }
    }
  }
  return frames;
}
