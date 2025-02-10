import { IItrInfo } from "../defines/js";

export function edit_itr_info(
  src: IItrInfo,
  ...edit: Partial<IItrInfo>[]
): void {
  Object.assign(src, ...edit);
}
