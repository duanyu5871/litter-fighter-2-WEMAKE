import { IBdyInfo } from "../defines/js";

export function copy_bdy_info(
  src: IBdyInfo,
  edit: Partial<IBdyInfo>,
): IBdyInfo {
  return { ...(JSON.parse(JSON.stringify(src)) as any), ...edit };
}
