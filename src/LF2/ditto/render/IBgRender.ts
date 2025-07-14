import Background from "../../bg/Background";

export interface IBgRender {
  bg: Background | null;
  release(): void;
  render(): void;
}
