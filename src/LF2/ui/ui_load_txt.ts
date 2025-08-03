import { LF2 } from "../LF2";
import { is_str } from "../utils";
import type { TUITxtInfo } from "./IUIInfo.dat";
import { IUITxtInfo } from "./IUITxtInfo.dat";

export async function ui_load_txt(lf2: LF2, txt: TUITxtInfo | TUITxtInfo[], output?: IUITxtInfo[]) {
  const txts = Array.isArray(txt) ? txt : [txt];
  const infos = await Promise.all(
    txts.map(txt => {
      const info: IUITxtInfo = is_str(txt) ? { value: txt, style: {} } : txt;
      const value = lf2.lang ? ((info as any)[`value#${lf2.lang.toLowerCase()}`] ?? info.value) : info.value
      return lf2.images.load_text(value, info.style);

    })
  );
  return infos;
}
