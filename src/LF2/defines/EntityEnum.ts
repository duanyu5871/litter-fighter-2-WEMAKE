export enum EntityEnum {
  Entity = 0b000100,
  Fighter = 0b001000,
  Weapon = 0b010000,
  Ball = 0b100000,
}
export type TEntityEnum = EntityEnum |
  0b000100 |
  0b001000 |
  0b010000 |
  0b100000;
export const ALL_ENTITY_ENUM: TEntityEnum[] = [
  EntityEnum.Fighter,
  EntityEnum.Weapon,
  EntityEnum.Ball,
  EntityEnum.Entity,
];
