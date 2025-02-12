
export interface IEntityRenderer {
  readonly renderer_type: string;
  get visible(): boolean;
  set visible(v: boolean);
  on_mount(): void;
  on_unmount(): void;
  update(): void;
}
