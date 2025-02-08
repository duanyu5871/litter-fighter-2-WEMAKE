import type { EntityGroup, IEntityInfo } from "../defines";

export function add_entity_groups(
  info: IEntityInfo,
  ...groups: EntityGroup[]
) {
  if (!groups.length) return;
  info.group = info.group || [];
  for (const group of groups) {
    if (info.group.indexOf(group) < 0) {
      info.group.push(group);
    }
  }
}
