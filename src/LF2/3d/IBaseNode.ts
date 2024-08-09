import type LF2 from "../LF2";

export interface IBaseNode {
  readonly is_base_node: true;
  readonly lf2: LF2;

  get parent(): IBaseNode | undefined;
  set parent(v: IBaseNode | undefined);

  get children(): readonly IBaseNode[];

  get name(): string;
  set name(v: string);

  get user_data(): Record<string, any>;

  apply(): this;

  add(...sp: IBaseNode[]): this;

  del(...sp: IBaseNode[]): this;

  del_self(): void;

  dispose(): void;

  get_user_data(key: string): any;

  add_user_data(key: string, value: any): this;

  del_user_data(key: string): this;

  merge_user_data(v: Record<string, any>): this;
}
export const is_base_node = (v: any): v is IBaseNode =>
  v?.is_base_node === true