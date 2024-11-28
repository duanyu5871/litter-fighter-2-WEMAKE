import type Ball from "./Ball";
import type Character from "./Character";
import type Entity from "./Entity";
import type Weapon from "./Weapon";
export const is_character = (v: any): v is Character => v?.is_character === true;
export const is_ball = (v: any): v is Ball => v?.is_ball === true;
export const is_weapon = (v: any): v is Weapon => v?.is_weapon === true;
export const is_entity = (v: any): v is Entity => v?.is_entity === true;