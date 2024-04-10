import { is_num } from '../js_utils/is_num';
import { Defines } from '../js_utils/lf2_type/defines';
import { ILf2Callback } from './LF2';
import Stage from './Stage';
import type { IWorldCallbacks, World } from './World';
import './game_overlay.css';
const ele = document.createElement.bind(document);
export class GameOverlay implements IWorldCallbacks, ILf2Callback {
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
    world.lf2.add_callbacks(this);
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
    this.btn_free_cam.type = 'button';
    this.btn_free_cam.addEventListener('click', () => {
      this.cam_locked = false;
      if (is_num(this.world.lock_cam_x)) {
        this.draw_cam_bar(this.world.lock_cam_x)
        this.world.lock_cam_x = void 0;
      }
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

  cam_bar_handle_padding = 2.5;
  handle_cam_ctrl_pointer_event(e: PointerEvent) {
    if (!this.cam_bar_ctx) return;
    const { left, width } = this.cam_bar.getBoundingClientRect();
    const s_width = this.world.stage.width;
    const w = Math.floor(width * Defines.OLD_SCREEN_WIDTH / s_width);
    const x = Math.min(width - w - 3, Math.max(0, Math.floor(e.pageX - left - w / 2)));
    this.world.lock_cam_x = s_width * x / width;
  }

  draw_cam_bar(x: number) {
    if (!this.cam_bar_ctx) return;
    const background_w = this.world.stage.width;
    const screen_w = Defines.OLD_SCREEN_WIDTH;

    const { width: bar_width, height } = this.cam_bar;
    const { player_left, player_right } = this.world.stage;

    const x_l = Math.floor(bar_width * player_left / background_w);
    const x_r = Math.floor(bar_width * player_right / background_w);
    const hh = this.cam_bar_handle_padding;
    const w = Math.floor(bar_width * screen_w / background_w) - hh
    const h = height - hh * 2;

    this.cam_bar_ctx.fillStyle = this.cam_bar_ctx.strokeStyle = '#FF000055'
    this.cam_bar_ctx.fillRect(0, 0, x_l, height);
    this.cam_bar_ctx.fillRect(x_r, 0, bar_width - x_r, height);


    this.cam_bar_ctx.lineWidth = 1;
    this.cam_bar_ctx.strokeStyle = '#FFFFFF55'
    this.cam_bar_ctx.strokeRect(x + hh, hh, w, h);
    if (this.cam_locked) {
      this.cam_bar_ctx.fillStyle = '#FFFFFF88';
      this.cam_bar_ctx.fillRect(x + hh, hh, w, h);
    }
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
    this.on_cam_move(_world, this.world.camera.position.x)
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
    world.lf2.del_callbacks(this);
  }
  on_loading_end() {
    this.loading = '';
  }
  on_loading_content(content: string) {
    this.loading = content;
  }
}