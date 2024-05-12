
import { Defines } from '../../common/lf2_type/defines';
import { is_num } from '../../common/type_check';
import { ILf2Callback } from '../ILf2Callback';
import type { IWorldCallbacks } from '../IWorldCallbacks';
import type { World } from '../World';
import './game_overlay.css';
const ele = document.createElement.bind(document);
export class GameOverlay {
  readonly world: World;
  protected ele: HTMLDivElement | null | undefined;
  protected ele_fps: HTMLElement;
  protected ele_ups: HTMLElement;
  protected ele_cam_bar: HTMLCanvasElement;
  protected ele_loading: HTMLSpanElement;
  protected ele_btn_free_cam: HTMLButtonElement;

  private cam_bar_pressing = false;
  private ctx_cam_bar: CanvasRenderingContext2D | null = null;
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

  constructor(world: World, container: HTMLDivElement | null | undefined) {
    this.world = world;
    this.ele = container;
    this.ele_fps = ele('span');
    this.ele_fps.className = 'txt_game_overlay'
    this.ele_ups = ele('span');
    this.ele_ups.className = 'txt_game_overlay'
    this.ele_loading = ele('span');
    this.ele_loading.className = 'txt_game_overlay'
    this.ele_cam_bar = ele('canvas');
    this.ele_btn_free_cam = ele('button');
    this.init_ele_btn_free_cam()
    this.init_ele_cam_bar();
    world.lf2.callbacks.add(this._l_listener);
    world.callbacks.add(this._w_listener);

    if (!container) return;
    container.innerHTML = ''
    container.append(
      this.ele_fps, ele('br'),
      this.ele_ups, ele('br'),
      this.ele_loading, ele('br'),
      this.ele_cam_bar,
      this.ele_btn_free_cam
    );
  }
  init_ele_btn_free_cam() {
    this.ele_btn_free_cam.style.display = 'none';
    this.ele_btn_free_cam.className = 'btn_free_cam';
    this.ele_btn_free_cam.innerText = '释放';
    this.ele_btn_free_cam.type = 'button';
    this.ele_btn_free_cam.addEventListener('click', () => {
      this.cam_locked = false;
      if (is_num(this.world.lock_cam_x)) {
        this.draw_cam_bar(this.world.lock_cam_x)
        this.world.lock_cam_x = void 0;
      }
    })
  }
  init_ele_cam_bar() {
    this.ele_cam_bar.style.display = 'none';
    this.ele_cam_bar.className = 'camera_ctrl lf2_hoverable_border';
    this.ctx_cam_bar = this.ele_cam_bar.getContext('2d');
    this.ele_cam_bar.addEventListener('pointerdown', this._pointer_down);
    window.addEventListener('pointermove', this._pointer_move);
    window.addEventListener('pointerup', this._pointer_up);
    window.addEventListener('pointercancel', this._pointer_up);

  }

  cam_bar_handle_padding = 2.5;
  handle_cam_ctrl_pointer_event(e: PointerEvent) {
    if (!this.ctx_cam_bar) return;
    const { left, width } = this.ele_cam_bar.getBoundingClientRect();
    const s_width = this.world.stage.width;
    const w = Math.floor(width * Defines.OLD_SCREEN_WIDTH / s_width);
    const x = Math.min(width - w - 3, Math.max(0, Math.floor(e.pageX - left - w / 2)));
    this.world.lock_cam_x = s_width * x / width;
  }

  draw_cam_bar(x: number) {
    if (!this.ctx_cam_bar) return;
    const background_w = this.world.stage.width;
    const screen_w = Defines.OLD_SCREEN_WIDTH;
    const { width: bar_width, height } = this.ele_cam_bar;
    const { player_left, player_right } = this.world.stage;
    const x_l = Math.floor(bar_width * player_left / background_w);
    const x_r = Math.floor(bar_width * player_right / background_w);
    const hh = this.cam_bar_handle_padding;
    const w = Math.floor(bar_width * screen_w / background_w) - hh
    const h = height - hh * 2;
    this.ctx_cam_bar.fillStyle = this.ctx_cam_bar.strokeStyle = '#FF000055'
    this.ctx_cam_bar.fillRect(0, 0, x_l, height);
    this.ctx_cam_bar.fillRect(x_r, 0, bar_width - x_r, height);
    this.ctx_cam_bar.lineWidth = 1;
    this.ctx_cam_bar.strokeStyle = '#FFFFFF55'
    this.ctx_cam_bar.strokeRect(x + hh, hh, w, h);
    if (this.cam_locked) {
      this.ctx_cam_bar.fillStyle = '#FFFFFF88';
      this.ctx_cam_bar.fillRect(x + hh, hh, w, h);
    }
  }

  set FPS(v: number) {
    this.ele_fps.innerText = 'FPS:' + v.toFixed(0);
  }

  set UPS(v: number) {
    this.ele_ups.innerText = 'UPS:' + v.toFixed(0);
  }

  set loading(v: string) {
    this.ele_loading.innerText = v;
  }

  private update_timer: ReturnType<typeof setInterval> | undefined;

  update_camera = () => {
    this.world.update_camera();
    this.world.stage.bg.update();
  };

  private _l_listener: Partial<ILf2Callback> = {
    on_loading_content: (content, progress) => this.loading = `${content}, ${progress}%`,
  }
  private _w_listener: Partial<IWorldCallbacks> = {
    on_ups_update: ups => this.UPS = ups,
    on_fps_update: fps => this.FPS = fps,
    on_pause_change: pause => {
      if (pause) {
        this.update_timer = setInterval(this.update_camera, 1000 / 60);
      } else {
        clearInterval(this.update_timer)
      }
    },
    on_stage_change: stage => {
      if (stage.bg.id === Defines.VOID_BG.id) {
        this.ele_cam_bar.style.display = this.ele_btn_free_cam.style.display = 'none';
      } else {
        this.ele_cam_bar.style.display = this.ele_btn_free_cam.style.display = 'unset';
      }
      this._w_listener.on_cam_move?.(this.world.camera.position.x);
    },
    on_cam_move: cam_x => {
      const { width, height } = this.ele_cam_bar.getBoundingClientRect();
      this.ele_cam_bar.width = width;
      this.ele_cam_bar.height = height;
      const s_width = this.world.stage.width;
      const x = cam_x * width / s_width;
      this.draw_cam_bar(x)
    },
    on_disposed: () => {
      clearInterval(this.update_timer)
      this.update_timer = void 0;
      this.world.lf2.callbacks.del(this._l_listener);
      this.world.callbacks.del(this._w_listener)
    }
  }
}