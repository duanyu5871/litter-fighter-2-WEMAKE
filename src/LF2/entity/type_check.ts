import { BaseController } from "../controller/BaseController";
import type { BotController } from "../controller/BotController";
import type LocalController from "../controller/LocalController";
import type Ball from "./Ball";
import type Character from "./Character";
import type Entity from "./Entity";
import type Weapon from "./Weapon";
export const is_character = (v: any): v is Character => v?.is_character === true;
export const is_ball = (v: any): v is Ball => v?.is_ball === true;
export const is_weapon = (v: any): v is Weapon => v?.is_weapon === true;
export const is_entity = (v: any): v is Entity => v?.is_entity === true;
export const is_base_ctrl =
  (v: any): v is BaseController => v?.is_base_controller === true
export const is_bot_ctrl =
  (v: any): v is BotController => v?.is_bot_enemy_chaser === true
export const is_local_ctrl =
  (v: any): v is LocalController => v?.is_local_controller === true