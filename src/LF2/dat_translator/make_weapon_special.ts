import { BuiltIn_OID, Defines, EntityGroup, IOpointInfo } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import { OpointKind } from "../defines/OpointKind";
import { add_entity_groups } from "./add_entity_to_group";

export function make_weapon_special(data: IEntityData) {
  const ooo = (...frame_ids: string[]): IOpointInfo[] => {
    const aa = [
      { dvy: 5, dvx: -1 },
      { dvy: 5, dvx: 1 },
      { dvy: 3 },
      { dvy: 2, dvx: 2 },
      { dvy: 2, dvx: -2 },
      { dvy: 4, dvx: -1.5 },
      { dvy: 4, dvx: 1.5 },
      { dvy: 2 },
      { dvy: 1, dvx: 1 },
      { dvy: 1, dvx: -1 },
    ];
    return frame_ids.map((frame_id, idx) => {
      return {
        kind: OpointKind.Normal,
        x: 24,
        y: 24,
        action: { id: frame_id },
        oid: "999",
        ...aa[idx],
      };
    });
  };

  const num_data_id = Number(data.id);
  if (num_data_id >= 100 || num_data_id <= 199) {
    add_entity_groups(
      data.base,
      EntityGroup.VsRegularWeapon,
      EntityGroup.StageRegularWeapon,
    );
  }
  switch (data.id) {
    case BuiltIn_OID.HenryArrow1:
      data.base.weight = 0.8
      data.base.brokens = ooo();
      break;
    case BuiltIn_OID.RudolfWeapon:
      data.base.weight = 0.8
      data.base.brokens = ooo();
      break;
    case BuiltIn_OID.Weapon_Stick:
      data.base.brokens = ooo("10", "10", "14", "14", "14");
      break;
    case BuiltIn_OID.Weapon_Hoe:
      data.base.brokens = ooo("30", "30", "20", "20", "24");
      break;
    case BuiltIn_OID.Weapon_Knife:
      data.base.brokens = ooo("30", "30", "24", "24");
      break;
    case BuiltIn_OID.Weapon_baseball:
      data.base.brokens = ooo("60", "60", "60", "60", "60");
      break;
    case BuiltIn_OID.Weapon_milk:
      data.base.brokens = ooo("70", "50", "80", "50", "50");
      add_entity_groups(data.base, EntityGroup.VsRegularWeapon);
      break;
    case BuiltIn_OID.Weapon_Stone:
      data.base.brokens = ooo("0", "0", "4", "4", "4");
      break;
    case BuiltIn_OID.Weapon_WoodenBox:
      data.base.brokens = ooo("40", "44", "50", "54", "54");
      break;
    case BuiltIn_OID.Weapon_Beer:
      data.base.brokens = ooo("160", "164", "164", "164", "164");
      add_entity_groups(data.base, EntityGroup.VsRegularWeapon);
      break;
    case BuiltIn_OID.Weapon_Boomerang:
      data.base.brokens = ooo("170", "170", "170");
      break;
    case BuiltIn_OID.Weapon_LouisArmourA:
      data.base.brokens = ooo("174", "174", "174", "174", "174");
      break;
    case BuiltIn_OID.Weapon_LouisArmourB:
      data.base.brokens = ooo("174", "174", "174", "174", "174");
      break;
    case BuiltIn_OID.Weapon_IceSword:
      data.base.brokens = ooo("150", "150", "150", "154", "154", "154", "154");
      break;
  }
}
