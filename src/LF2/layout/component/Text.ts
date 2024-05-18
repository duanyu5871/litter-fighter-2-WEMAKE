import LF2 from "../../LF2";
import IStyle from "../../defines/IStyle";
import { is_fun } from "../../utils/type_check";
import Sprite from "./Sprite";

export default class Text extends Sprite {
  readonly lf2: LF2;

  protected _style: IStyle = {};
  protected _text: string = '';
  protected _jid: number = 0;
  protected _changed: boolean = true;

  get style(): IStyle { return this._style; }

  constructor(lf2: LF2) {
    super()
    this.lf2 = lf2;
  }

  set_style(v: IStyle | ((v: IStyle) => IStyle)): this {
    this._style = typeof v === 'function' ? v(this._style) : v;
    this._changed = true;
    return this;
  }


  set_text(v: string): this {
    this._text = v;
    this._changed = true;
    return this;
  }

  protected async update_text(text: string, style: IStyle, jid: number) {
    if (jid !== this._jid) return;
    const pic = await this.lf2.images.create_pic_by_text(text, style);
    if (jid !== this._jid) { pic.texture.dispose(); return; }
    this.set_info(pic);
    super.apply();
  }

  override apply(): this {
    if (this._changed)
      this.update_text(this._text, this._style, ++this._jid);
    else
      super.apply()
    this._changed = false;
    return this;
  }
}