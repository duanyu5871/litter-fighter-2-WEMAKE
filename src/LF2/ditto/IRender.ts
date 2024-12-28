export interface IRender {
  add(handler: (time: number) => void): number;
  del(render_id: number): void;
}
