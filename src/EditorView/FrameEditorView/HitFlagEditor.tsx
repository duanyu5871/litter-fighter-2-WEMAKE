import { Checkbox } from "../../Component/Checkbox";
import { Flex } from "../../Component/Flex";
import { EntityEnum } from "../../LF2/defines";
import { IFieldProps } from "./make_field_props";
export interface IHitFlagEditorProps extends IFieldProps<number> {

}
export function HitFlagEditor(props: IHitFlagEditorProps) {
  const { defaultValue = 0, value = defaultValue, onChange } = props
  return (
    <Flex direction='row' gap={5}>
      <Checkbox prefix='敌人' value={(value & 0b1) !== 0}
        onChange={checked => onChange?.(checked ? (value | 0b1) : (value ^ 0b1))} />
      <Checkbox prefix='队友' value={(value & 0b10) !== 0}
        onChange={checked => onChange?.(checked ? (value | 0b10) : (value ^ 0b10))} />
      <Checkbox prefix='角色' value={(value & EntityEnum.Fighter) !== 0}
        onChange={checked => onChange?.(checked ? (value | EntityEnum.Fighter) : (value ^ EntityEnum.Fighter))} />
      <Checkbox prefix='武器' value={(value & EntityEnum.Weapon) !== 0}
        onChange={checked => onChange?.(checked ? (value | EntityEnum.Weapon) : (value ^ EntityEnum.Weapon))} />
      <Checkbox prefix='气功' value={(value & EntityEnum.Ball) !== 0}
        onChange={checked => onChange?.(checked ? (value | EntityEnum.Ball) : (value ^ EntityEnum.Ball))} />
      <Checkbox prefix='其他' value={(value & EntityEnum.Entity) !== 0}
        onChange={checked => onChange?.(checked ? (value | EntityEnum.Entity) : (value ^ EntityEnum.Entity))} />
    </Flex>
  );
}
