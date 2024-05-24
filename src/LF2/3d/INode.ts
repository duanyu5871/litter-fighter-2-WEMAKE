export default interface INode {
  get parent(): INode | undefined;
  set parent(v: INode | undefined);

  get children(): readonly INode[];

  get x(): number;
  set x(v: number);

  get y(): number;
  set y(v: number);

  get z(): number;
  set z(v: number);

  get name(): string;
  set name(v: string);

  get visible(): boolean;
  set visible(v: boolean);

  get opacity(): number;
  set opacity(v: number);

  get w(): number;
  get h(): number;

  get size(): [number, number];
  set size([w, h]: [number, number]);

  get user_data(): Record<string, any>;

  get rgb(): [number, number, number];
  set rgb([r, g, b]: [number, number, number]);

  unset_size(): this;

  set_opacity(v: number): this;

  set_visible(v: boolean): this;

  set_name(v: string): this;

  set_x(x: number): this;

  set_y(y: number): this;

  set_z(z: number): this;

  set_pos(x: number, y: number, z: number): this;

  set_size(w: number, h: number): this;

  set_center(x: number, y: number): this;

  apply(): this;

  add(...sp: INode[]): this;

  del(...sp: INode[]): this;

  del_self(): void;

  dispose(): void;

  get_user_data(key: string): any;

  add_user_data(key: string, value: any): this;

  del_user_data(key: string): this;

  merge_user_data(v: Record<string, any>): this;

  set_rgb(r: number, g: number, b: number): this;
}
