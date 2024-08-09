import IStyle from "../defines/IStyle";
import { ISpriteNode } from "./ISpriteNode";

export interface ITextNode extends ISpriteNode {
  readonly is_text_node: true;
  get style(): IStyle;
  set style(v: IStyle);
  get text(): string;
  set text(v: string);

  get_style(): Readonly<IStyle>;
  set_style(v: IStyle): this;
  get_text(): string;
  set_text(v: string): this;
}
export const is_text_node = (v: any): v is ITextNode =>
  v?.is_text_node === true