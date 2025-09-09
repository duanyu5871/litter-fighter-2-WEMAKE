import { IBdyInfo } from "../defines";
import JSON5 from "json5"
export function copy_bdy_info(
  src: IBdyInfo,
  edit: Partial<IBdyInfo>,
): IBdyInfo {
  return { ...(JSON5.parse(JSON5.stringify(src)) as any), ...edit };
}
