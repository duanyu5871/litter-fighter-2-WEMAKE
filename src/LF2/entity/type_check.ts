import type { BallController } from "../controller/BallController";
import type { BaseController } from "../controller/BaseController";
import type { BotController } from "../bot/BotController";
import type { LocalController } from "../controller/LocalController";
import type { IBgData } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import type { IEntityData } from "../defines/IEntityData";
export const is_character_data = (v: any) => v?.type === EntityEnum.Fighter;
export const is_weapon_data = (v: any) => v?.type === EntityEnum.Weapon;
export const is_ball_data = (v: any) => v?.type === EntityEnum.Ball;
export const is_character = (v: any) => is_character_data(v?.data);
export const is_ball = (v: any) => is_ball_data(v?.data);
export const is_weapon = (v: any) => is_weapon_data(v?.data);
export const is_base_ctrl = (v: any): v is BaseController =>
  v?.__is_base_ctrl__ === true;
export const is_bot_ctrl = (v: any): v is BotController =>
  v?.__is_bot_ctrl__ === true;
export const is_local_ctrl = (v: any): v is LocalController =>
  v?.__is_local_ctrl__ === true;
export const is_ball_ctrl = (v: any): v is BallController =>
  v?.__is_ball_ctrl__ === true;
export const is_entity_data = (v: any): v is IEntityData =>
  v.type === EntityEnum.Entity ||
  is_character_data(v) ||
  is_weapon_data(v) ||
  is_ball_data(v);
export const is_bg_data = (v: any): v is IBgData => v.type === "background";
