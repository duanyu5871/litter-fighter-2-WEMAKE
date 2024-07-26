import axios from "axios";
import AsyncValuesKeeper from "../../base/AsyncValuesKeeper";
import { Defines } from "../../defines/defines";
import BaseSounds from "../../ditto/sounds/BaseSounds";
import float_equal from "../../utils/math/float_equal";
import { clamp } from "three/src/math/MathUtils";

export class __Modern extends BaseSounds {
  readonly ctx = new AudioContext();
  protected _req_id: number = 0;
  protected _prev_bgm_url: string | null = null;
  protected _bgm_node: { src_node: AudioBufferSourceNode, gain_node: GainNode } | null = null;

  protected _r = new AsyncValuesKeeper<AudioBuffer>();
  protected _bgm_name: string | null = null;
  protected _sound_id = 0;
  protected _playings = new Map<string, { src_node: AudioBufferSourceNode, l_gain_node: GainNode, r_gain_node: GainNode, sound_x: number }>()
  protected _muted: boolean = false;
  protected _volume: number = 0.3;
  protected _bgm_volume: number = 1;
  protected _sound_volume: number = 1;
  protected _bgm_muted: boolean = false;
  protected _sound_muted: boolean = false;

  bgm_volume(): number {
    return this._bgm_volume
  }
  set_bgm_volume(v: number): void {
    v = clamp(v, 0, 1);
    const prev = this.bgm_volume();
    if (float_equal(v, prev)) return;
    this._bgm_volume = v;
    this.apply_bgm_volume();
    this._callbacks.emit('on_bgm_volume_changed')(v, prev, this)
  }
  sound_volume(): number {
    return this._sound_volume
  }
  set_sound_volume(v: number): void {
    v = clamp(v, 0, 1);
    const prev = this.sound_volume()
    if (float_equal(v, prev)) return;
    this._sound_volume = v;
    this.apply_sound_volume();
    this._callbacks.emit('on_sound_volume_changed')(v, prev, this)
  }

  muted(): boolean {
    return this._muted;
  }

  set_muted(v: boolean): void {
    if (v === this.muted()) return;
    this._muted = v;
    this.apply_volume();
    this._callbacks.emit('on_muted_changed')(v, this)
  }

  bgm_muted(): boolean {
    return this._bgm_muted;
  }

  set_bgm_muted(v: boolean): void {
    if (v === this.bgm_muted()) return;
    this._bgm_muted = v;
    this.apply_bgm_volume();
    this._callbacks.emit('on_bgm_muted_changed')(v, this)
  }

  sound_muted(): boolean {
    return this._sound_muted;
  }

  set_sound_muted(v: boolean): void {
    if (v === this.sound_muted()) return;
    this._sound_muted = v;
    this.apply_sound_volume();
    this._callbacks.emit('on_sound_muted_changed')(v, this)
  }

  override volume(): number {
    return this._volume;
  }
  override set_volume(v: number): void {
    v = clamp(v, 0, 1);
    const prev = this.volume()
    if (float_equal(v, prev)) return;
    this._volume = v;
    this.apply_volume();
    this._callbacks.emit('on_volume_changed')(v, prev, this)
  }

  protected apply_volume(): void {
    this.apply_bgm_volume();
    this.apply_sound_volume();
  }

  protected apply_sound_volume() {
    for (const [, { sound_x, l_gain_node, r_gain_node }] of this._playings) {
      const [, l_vol, r_vol] = this.get_l_r_vol(sound_x);
      l_gain_node.gain.value = l_vol;
      r_gain_node.gain.value = r_vol;
    }
  }

  protected apply_bgm_volume() {
    if (!this._bgm_node) return;
    const muted = this._muted || this._bgm_muted;
    this._bgm_node.gain_node.gain.value = muted ? 0 : (this._volume * this._bgm_volume);
  }

  override bgm(): string | null {
    return this._bgm_name;
  }

  override has(name: string): boolean {
    return this._r.values.has(name);
  }

  override load(name: string, src: string) {
    return this._r.get(name, async () => {
      this.lf2.on_loading_content(`${name}`, 0);
      const [url] = await this.lf2.import_resource(src);
      const buf = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' })
        .then(v => this.ctx.decodeAudioData(v.data));
      this.lf2.on_loading_content(`${name}`, 100);
      return buf
    })
  }

  override stop_bgm() {
    if (!this._bgm_node) return;
    const prev = this.bgm();
    this._bgm_name = null;
    this._bgm_node.src_node.stop();
    this._prev_bgm_url = null;
    this._callbacks.emit('on_bgm_changed')(null, prev, this);
  }

  override play_bgm(name: string, restart?: boolean | undefined): () => void {
    if (!restart && this._prev_bgm_url === name) return () => { };

    const prev = this.bgm();

    this.stop_bgm();
    this._bgm_name = name;
    this._prev_bgm_url = name;
    ++this._req_id;

    const req_id = this._req_id;
    const ctx = this.ctx;
    const buf = this._r.values.get(name);
    const start = (buf: AudioBuffer) => {
      const src_node = ctx.createBufferSource();
      src_node.buffer = buf;
      src_node.start();

      const gain_node = this.ctx.createGain()
      gain_node.connect(ctx.destination)
      src_node.connect(gain_node)
      src_node.loop = true;
      this._bgm_node = {
        src_node,
        gain_node
      }
      this.apply_bgm_volume()
    };
    if (buf) {
      start(buf);
    } else {
      this.load(name, name).then(start)
    }

    this._callbacks.emit('on_bgm_changed')(name, prev, this);
    return () => (req_id === this._req_id) && this.stop_bgm();
  }

  protected get_l_r_vol(x?: number) {
    const edge_w = Defines.OLD_SCREEN_WIDTH / 2;
    const viewer_x = this.lf2.world.camera.x + edge_w;
    const sound_x = x ?? viewer_x;
    const muted = this._muted || this._sound_muted;
    return [
      sound_x,
      (muted ? 0 : (this._volume * this._sound_volume)) * Math.max(0, 1 - Math.abs((sound_x - viewer_x + edge_w) / Defines.OLD_SCREEN_WIDTH)),
      (muted ? 0 : (this._volume * this._sound_volume)) * Math.max(0, 1 - Math.abs((sound_x - viewer_x - edge_w) / Defines.OLD_SCREEN_WIDTH))
    ]
  }
  override play(name: string, x?: number, y?: number, z?: number): string {
    const buf = this._r.values.get(name);
    if (!buf) return '';

    const [sound_x, l_vol, r_vol] = this.get_l_r_vol(x);

    const ctx = this.ctx;
    const src_node = ctx.createBufferSource();
    src_node.buffer = buf;

    const splitter_node = this.ctx.createChannelSplitter(1);
    src_node.connect(splitter_node);

    const merger_node = this.ctx.createChannelMerger(2);

    const l_gain_node = this.ctx.createGain();
    l_gain_node.gain.value = l_vol;
    l_gain_node.connect(merger_node, 0, 0);
    splitter_node.connect(l_gain_node, 0);

    const r_gain_node = this.ctx.createGain();
    r_gain_node.gain.value = r_vol;
    r_gain_node.connect(merger_node, 0, 1);
    splitter_node.connect(r_gain_node, 0);

    merger_node.connect(this.ctx.destination);
    src_node.start();


    const id = '' + (++this._sound_id);
    this._playings.set(id, {
      src_node,
      l_gain_node,
      r_gain_node,
      sound_x,
    })
    src_node.onended = () => this._playings.delete(id);
    return id;
  }

  override stop(id: string): void {
    const n = this._playings.get(id);
    if (!n) return;
    n.src_node.stop();
    this._playings.delete(id)
  }

  override dispose(): void {
    super.dispose();
    this._r.clean();
    this._playings.forEach(v => v.src_node.stop())
    this._playings.clear();
  }
}
