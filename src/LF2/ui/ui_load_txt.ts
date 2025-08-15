import IStyle from "../defines/IStyle";
import { LF2 } from "../LF2";
import { is_str } from "../utils";
import { ICookedUIInfo } from "./ICookedUIInfo";
import type { TUITxtInfo } from "./IUIInfo.dat";
import { IUITxtInfo } from "./IUITxtInfo.dat";

export async function ui_load_txt(lf2: LF2, txt: TUITxtInfo | TUITxtInfo[], ui_info?: ICookedUIInfo) {
  const txts = Array.isArray(txt) ? txt : [txt];
  const infos = await Promise.all(
    txts.map(txt => {
      const info: IUITxtInfo = is_str(txt) ? { i18n: txt } : txt;
      let { i18n, style } = info;
      if (i18n?.startsWith("$p_val:"))
        console.log({ ...ui_info })

      if (i18n?.startsWith("$val:")) {
        if (ui_info?.values) {
          const real_i18n = ui_info?.values[i18n.substring(5).trim()]
          i18n = real_i18n || i18n
        }
      } else if (i18n?.startsWith("$p_val:")) {
        if (ui_info?.parent?.values) {
          const real_i18n = ui_info?.parent?.values[i18n.substring(7).trim()]
          console.log(ui_info?.parent?.values, i18n.substring(7).trim())
          i18n = real_i18n || i18n
        }
      }
      if (typeof style === 'string') {
        if (style?.startsWith("$val:")) {
          if (ui_info?.values) {
            style = ui_info?.values[style.substring(5).trim()] as IStyle
          }
        } else if (style?.startsWith("$p_val:")) {
          if (ui_info?.parent?.values) {
            style = ui_info?.parent?.values[style.substring(7).trim()] as IStyle
          }
        }
      }
      const value = '' + (info.value ?? lf2.string(i18n) ?? i18n ?? '');
      return lf2.images.load_text(value, style as IStyle);
    })
  );
  return infos;
}
