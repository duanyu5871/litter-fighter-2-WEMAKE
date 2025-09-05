export enum EntityEnum {
  Character = "character",
  Weapon = "weapon",
  Ball = "ball",
  Entity = "entity",
}
export type TEntityEnum =
  | EntityEnum
  | "character"
  | "weapon"
  | "ball"
  | "entity";
export const ALL_ENTITY_ENUM: TEntityEnum[] = [
  EntityEnum.Character,
  EntityEnum.Weapon,
  EntityEnum.Ball,
  EntityEnum.Entity,
];
