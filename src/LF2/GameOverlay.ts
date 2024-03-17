import { Defines } from '../js_utils/lf2_type/defines';
import Stage from './Stage';
import type { IWorldCallbacks, World } from './World';
import './game_overlay.css';
const ele = document.createElement.bind(document);
export class GameOverlay implements IWorldCallbacks {
  readonly world: World;
  readonly ele: HTMLDivElement | null | undefined;
  readonly fps_ele: HTMLElement;
  readonly ups_ele: HTMLElement;
  readonly cam_bar: HTMLCanvasElement;
  readonly loading_ele: HTMLSpanElement;

  private cam_bar_pressing = false;
  private cam_bar_ctx: CanvasRenderingContext2D | null = null;
  private cam_locked: boolean = false;

  private _pointer_down = (e: PointerEvent) => {
    if (!e.isPrimary) return;
    if (!this.cam_locked) this.cam_locked = true;
    this.cam_bar_pressing = true;
    this.handle_cam_ctrl_pointer_event(e);
  }
  private _pointer_move = (e: PointerEvent) => {
    if (!e.isPrimary || !this.cam_bar_pressing) return;
    this.handle_cam_ctrl_pointer_event(e);
  }
  private _pointer_up = (e: PointerEvent) => {
    if (!e.isPrimary || !this.cam_bar_pressing) return;
    this.cam_bar_pressing = false;
    this.handle_cam_ctrl_pointer_event(e);
  }
  btn_free_cam: HTMLButtonElement;

  constructor(world: World, container: HTMLDivElement | null | undefined) {
    this.world = world;
    this.world.callbacks.add(this);
    this.ele = container;
    this.fps_ele = ele('span');
    this.fps_ele.className = 'fps_txt'
    this.ups_ele = ele('span');
    this.ups_ele.className = 'fps_txt'
    this.loading_ele = ele('span');
    this.loading_ele.className = 'fps_txt'
    this.cam_bar = ele('canvas');
    this.btn_free_cam = ele('button');
    this.init_btn_free_cam()

    this.init_camera_ctrl();
    if (!container) return;
    container.innerHTML = ''
    container.append(
      this.fps_ele, ele('br'),
      this.ups_ele, ele('br'),
      this.loading_ele, ele('br'),
      this.cam_bar,
      this.btn_free_cam
    );
  }
  init_btn_free_cam() {
    this.btn_free_cam.className = 'btn_free_cam';
    this.btn_free_cam.innerText = 'free cam';
    this.btn_free_cam.addEventListener('click', () => {
      this.cam_locked = false;
      this.world.lock_cam_x = void 0;
    })
  }
  init_camera_ctrl() {
    this.cam_bar.className = 'camera_ctrl';
    this.cam_bar_ctx = this.cam_bar.getContext('2d');
    this.cam_bar.addEventListener('pointerdown', this._pointer_down);
    window.addEventListener('pointermove', this._pointer_move);
    window.addEventListener('pointerup', this._pointer_up);
    window.addEventListener('pointercancel', this._pointer_up);

  }
  handle_cam_ctrl_pointer_event(e: PointerEvent) {
    if (!this.cam_bar_ctx) return;
    const { left, width } = this.cam_bar.getBoundingClientRect();
    const s_width = this.world.stage.width;
    const w = Math.floor(width * Defines.OLD_SCREEN_WIDTH / s_width)
    const x = Math.min(width - w - 3, Math.max(0, Math.floor(e.pageX - left - w / 2)));
    this.world.lock_cam_x = s_width * x / width;
  }

  draw_cam_bar(x: number) {
    if (!this.cam_bar_ctx) return;
    const { width, height } = this.cam_bar;
    const s_width = this.world.stage.width;
    const w = Math.floor(width * Defines.OLD_SCREEN_WIDTH / s_width)
    const h = height - 3;
    this.cam_bar_ctx.lineWidth = 1;
    this.cam_bar_ctx.fillStyle = this.cam_bar_ctx.strokeStyle = '#FFFFFF55'
    this.cam_bar_ctx.strokeRect(x + 1.5, 1.5, w, h);
    if (this.cam_locked) this.cam_bar_ctx.fillRect(x + 1.5, 1.5, w, h);
  }

  set FPS(v: number) {
    this.fps_ele.innerText = 'FPS:' + v.toFixed(0);
  }
  set UPS(v: number) {
    this.ups_ele.innerText = 'UPS:' + v.toFixed(0);
  }
  set loading(v: string) {
    this.loading_ele.innerText = v;
  }
  on_cam_move(_world: World, cam_x: number): void {
    const { width, height } = this.cam_bar.getBoundingClientRect();
    this.cam_bar.width = width;
    this.cam_bar.height = height;
    const s_width = this.world.stage.width;
    const x = cam_x * width / s_width;
    this.draw_cam_bar(x)
  }
  on_stage_change(_world: World, _curr: Stage, _prev: Stage): void {
    const { width, height } = this.cam_bar.getBoundingClientRect();
    this.cam_bar.width = width;
    this.cam_bar.height = height;
    const cam_x = this.world.camera.position.x;
    const s_width = this.world.stage.width;
    const x = cam_x * width / s_width;
    this.draw_cam_bar(x)
  }

  private update_timer: ReturnType<typeof setInterval> | undefined;

  update_camera = () => {
    this.world.update_camera();
    this.world.stage.bg.update();
  };
  on_pause_change(_world: World, pause: boolean): void {
    if (pause) {
      this.update_timer = setInterval(this.update_camera, 1000 / 60);
    } else {
      if (this.update_timer) clearInterval(this.update_timer)
      this.update_timer = void 0;
    }
  }
  on_disposed(world: World): void {
    if (this.update_timer) clearInterval(this.update_timer)
    this.update_timer = void 0;
  }
}