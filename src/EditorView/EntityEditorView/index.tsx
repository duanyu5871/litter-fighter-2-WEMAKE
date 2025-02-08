import { IBaseSelectProps } from "../../Component/Select";
import { Defines, ItrEffect, ItrKind, StateEnum } from "../../LF2/defines";
import { BdyKind } from "../../LF2/defines/BdyKind";
import { EntityEnum } from "../../LF2/defines/EntityEnum";
import { SpeedMode } from "../../LF2/defines/SpeedMode";
import './style.scss';
const make_num_enum_select_props = (t: any): IBaseSelectProps<string, number> => ({
  items: Object.keys(t).filter(key => {
    if (key.startsWith('_')) return false;
    if (!Number.isNaN(Number(key))) return false;
    return true;
  }),
  parse: (k: string) => {
    const value = (t as any)[k];
    const label = `${k}(${value})`;
    return [value, label]
  }
})
const make_str_enum_select_props = (t: any): IBaseSelectProps<string, string> => ({
  items: Object.keys(t).filter(key => {
    if (key.startsWith('_')) return false;
    return true;
  }),
  parse: (k: string) => {
    const value = (t as any)[k];
    const label = `${k}(${value})`;
    return [value, label]
  }
})
export const STATE_SELECT_PROPS = make_num_enum_select_props(StateEnum);
export const SPEED_MODE_SELECT_PROPS = make_num_enum_select_props(SpeedMode);
export const ITR_KIND_SELECT_PROPS = make_num_enum_select_props(ItrKind);
export const ITR_EFFECT_SELECT_PROPS = make_num_enum_select_props(ItrEffect);
export const BDY_KIND_SELECT_PROPS = make_num_enum_select_props(BdyKind);
export const ENTITY_TYPE_SELECT_PROPS = make_str_enum_select_props(EntityEnum);