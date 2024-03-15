export class GameOverlay {
  ele: HTMLDivElement | null | undefined;
  readonly fps_ele: HTMLElement;
  readonly ups_ele: HTMLElement;
  readonly loading_ele: HTMLSpanElement;
  constructor(ele: HTMLDivElement | null | undefined) {
    this.ele = ele;
    this.fps_ele = document.createElement('span');
    this.ups_ele = document.createElement('span');
    this.loading_ele = document.createElement('span');
    if (ele) {
      ele.innerHTML = ''
      ele.append(
        'FPS:', this.fps_ele,
        document.createElement('br'),
        'UPS:', this.ups_ele,
        document.createElement('br'),
        this.loading_ele,
      );
    }
  }
  set FPS(v: number) {
    this.fps_ele.innerText = v.toFixed(0);
  }
  set UPS(v: number) {
    this.ups_ele.innerText = v.toFixed(0);
  }
  show_loading(v: string) {
    this.loading_ele.innerText = v;
  }
}
