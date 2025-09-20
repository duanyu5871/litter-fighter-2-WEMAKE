import { LF2 } from "../LF2";
import { ITextImageInfo } from "../loader/ITextImageInfo";
import { ICookedUITxtInfo } from "./IUITxtInfo.dat";
export async function ui_load_txt(lf2: LF2, txt: ICookedUITxtInfo | ICookedUITxtInfo[], out: ITextImageInfo[] = []) {
  const txts = Array.isArray(txt) ? txt : [txt];
  if (!txts.length) return []
  const infos = await Promise.all(
    txts.map(info => {
      const value = lf2.string(info.i18n);
      const r = lf2.images.load_text(value, info.style)
      return r;
    })
  );
  out.push(...infos)
  return infos;
}
