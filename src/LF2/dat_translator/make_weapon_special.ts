import { IOpointInfo, Defines } from '../defines';
import { IEntityData } from "../defines/IEntityData";
import { OpointKind } from '../defines/OpointKind';
import { add_entity_groups } from './add_entity_to_group';


export function make_weapon_special(data: IEntityData) {
  const ooo = (...frame_ids: string[]): IOpointInfo[] => {
    const aa = [
      { dvy: 5, dvx: -1, },
      { dvy: 5, dvx: 1, },
      { dvy: 3 },
      { dvy: 2, dvx: 2, },
      { dvy: 2, dvx: -2, },
      { dvy: 4, dvx: -1.5, },
      { dvy: 4, dvx: 1.5, },
      { dvy: 2 },
      { dvy: 1, dvx: 1, },
      { dvy: 1, dvx: -1, },
    ];
    return frame_ids.map((frame_id, idx) => {
      return {
        kind: OpointKind.Normal,
        x: 24,
        y: 24,
        action: { id: frame_id },
        oid: '999',
        ...aa[idx]
      };
    });
  };

  const num_data_id = Number(data.id);
  if (num_data_id >= 100 || num_data_id <= 199) {
    add_entity_groups(
      data.base,
      Defines.EntityGroup.VsRegularWeapon,
      Defines.EntityGroup.StageRegularWeapon
    );
  }
  switch (data.id) {
    case "100": // #stick
      data.base.brokens = ooo('10', '10', '14', '14', '14');
      break;
    case "101": // #hoe
      data.base.brokens = ooo('30', '30', '20', '20', '24');
      break;
    case "120": // #knife
      data.base.brokens = ooo('30', '30', '24', '24');
      break;
    case "121": // #baseball
      data.base.brokens = ooo('60', '60', '60', '60', '60');
      break;
    case "122": // #milk
      data.base.brokens = ooo('70', '50', '80', '50', '50');
      add_entity_groups(data.base, Defines.EntityGroup.VsRegularWeapon);
      break;
    case "150": // #stone
      data.base.brokens = ooo('0', '0', '4', '4', '4');
      break;
    case "151": // #wooden_box
      data.base.brokens = ooo('40', '44', '50', '54', '54');
      break;
    case "123": // #beer
      data.base.brokens = ooo('160', '164', '164', '164', '164');
      add_entity_groups(data.base, Defines.EntityGroup.VsRegularWeapon);
      break;
    case "124": // #<
      data.base.brokens = ooo('170', '170', '170');
      break;
    case "217": // #louis_armour
      data.base.brokens = ooo('174', '174', '174', '174', '174');
      break;
    case "218": // #louis_armour
      data.base.brokens = ooo('174', '174', '174', '174', '174');
      break;
    case "213": // #ice_sword
      data.base.brokens = ooo('150', '150', '150', '154', '154', '154', '154');
      break;
  }
}
