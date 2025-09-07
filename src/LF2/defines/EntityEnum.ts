export enum EntityEnum {
  Entity = 1,
  Fighter = 2,
  Weapon = 3,
  Ball = 4,
}
export type TEntityEnum = EntityEnum | 1 | 2 | 3 | 4;
export const ALL_ENTITY_ENUM: TEntityEnum[] = [
  EntityEnum.Fighter,
  EntityEnum.Weapon,
  EntityEnum.Ball,
  EntityEnum.Entity,
];
