import { IItrInfo } from "../defines/js";

export function copy_itr_info(
  src: IItrInfo,
  edit: Partial<IItrInfo>,
): IItrInfo {
  return { ...(JSON.parse(JSON.stringify(src)) as any), ...edit };
}
