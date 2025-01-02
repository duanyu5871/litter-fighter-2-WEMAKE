import { Defines } from "../LF2/defines/defines";
import Select, { ISelectProps } from "./Select";
export interface TeamSelectProps
  extends ISelectProps<Defines.TeamEnum, string> {}
export default function TeamSelect(props: TeamSelectProps) {
  return (
    <Select
      {...props}
      items={Defines.Teams}
      parse={(i) => [i, Defines.TeamInfoMap[i].name]}
    />
  );
}
