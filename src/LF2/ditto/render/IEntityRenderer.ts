
export interface IEntityRenderer {
  get visible(): boolean;
  set visible(v: boolean);
  on_mount(): void;
  on_unmount(): void;
  update(): void;
}
