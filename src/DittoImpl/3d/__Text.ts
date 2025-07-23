import { IText } from "../../LF2/3d/IText";
import IStyle from "../../LF2/defines/IStyle";
import __Sprite from "./__Sprite";

export class __Text extends __Sprite implements IText {
  readonly is_text_node = true;
  protected _style: IStyle = {};
  protected _text: string = "";
  protected _jid: number = 0;
  protected _changed: boolean = true;

  get style(): IStyle {
    return this._style;
  }
  set style(v: IStyle) {
    this.set_style(v);
  }
  get text(): string {
    return this._text;
  }
  set text(v: string) {
    this.set_text(v);
  }

  get_style() {
    return this._style;
  }
  set_style(v: IStyle): this {
    this._style = v;
    return this;
  }

  get_text(): string {
    return this._text;
  }
  set_text(v: string): this {
    this._text = v;
    return this;
  }

  protected async update_text(text: string, style: IStyle, jid: number) {
    const out_of_date = () => jid !== this._jid;
    if (out_of_date()) return;
    const pic = await this.lf2.images.create_pic_by_text(text, style);
    if (out_of_date()) {
      pic.texture.dispose();
      return;
    }
    this.set_info(pic);
    super.apply();
  }

  override apply(): this {
    this.update_text(this._text, this._style, ++this._jid);
    return this;
  }
}
