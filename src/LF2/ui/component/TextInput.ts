import { UIComponent } from "./UIComponent";

export class TextInput extends UIComponent {
  static override readonly TAG: string = 'TextInput';
  protected _text: string = '';

  get maxLength() { return this.props.num('maxLength') }
  get defaultValue() { return this.props.str('defaultValue') }

  get text(): string { return this._text; }
  set text(text: string) { this._text = text; }
}


