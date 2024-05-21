import axios from "axios";
import type LF2 from "../../LF2";
import AsyncValuesKeeper from "../../base/AsyncValuesKeeper";
import { Defines } from "../../defines/defines";
import { IPlayer } from "../../sound/IPlayer";


export default class ModernPlayer implements IPlayer {
  readonly ctx = new AudioContext();
  readonly lf2: LF2;
  protected _req_id: number = 0;
  protected _prev_bgm_url: string | null = null;
  protected _bgm_node: { src_node: AudioBufferSourceNode, gain_node: GainNode } | null = null;

  protected _r = new AsyncValuesKeeper<AudioBuffer>();
  protected _bgm_name: string | null = null;
  protected _sound_id = 0;
  protected _playings = new Map<string, { src_node: AudioBufferSourceNode, l_gain_node: GainNode, r_gain_node: GainNode, sound_x: number }>()
  protected _muted: boolean = true;
  protected _volume: number = 0.3;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  muted(): boolean {
    return this._muted;
  }
  set_muted(v: boolean): void {
    this._muted = v;
    this.apply_volume();
  }
  volume(): number {
    return this._volume;
  }
  set_volume(v: number): void {
    this._volume = v;
    this.apply_volume();
  }

  protected apply_volume(): void {
    if (this._bgm_node)
      this._bgm_node.gain_node.gain.value = (this._muted ? 0 : this._volume) / 4;
    for (const [, { sound_x, l_gain_node, r_gain_node }] of this._playings) {
      const [, l_vol, r_vol] = this.get_l_r_vol(sound_x);
      l_gain_node.gain.value = l_vol;
      r_gain_node.gain.value = r_vol;
    }
  }
  bgm(): string | null {
    return this._bgm_name;
  }

  has(name: string): boolean {
    return this._r.values.has(name);
  }

  load(name: string, src: string) {
    return this._r.get(name, async () => {
      this.lf2.on_loading_content(`loading: ${name}`, 0);
      const url = await this.lf2.import_resource(src);
      const buf = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' })
        .then(v => this.ctx.decodeAudioData(v.data));
      this.lf2.on_loading_content(`loading: ${name}`, 100);
      return buf
    })
  }

  stop_bgm() {
    if (!this._bgm_node) return;
    this._bgm_name = null;
    this._bgm_node.src_node.stop();
    this._prev_bgm_url = null;
  }

  play_bgm(name: string, restart?: boolean | undefined): () => void {
    if (!restart && this._prev_bgm_url === name) return () => { };
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
      gain_node.gain.value = (this._muted ? 0 : this._volume) / 4;
      src_node.connect(gain_node)
      src_node.loop = true;
      this._bgm_node = {
        src_node,
        gain_node
      }
    };
    if (buf) {
      start(buf);
    } else {
      this.load(name, name).then(start)
    }
    return () => (req_id === this._req_id) && this.stop_bgm();
  }

  protected get_l_r_vol(x?: number) {
    const edge_w = Defines.OLD_SCREEN_WIDTH / 2;
    const viewer_x = this.lf2.world.camera.position.x + edge_w;
    const sound_x = x ?? viewer_x;
    return [
      sound_x,
      (this._muted ? 0 : this._volume) * Math.max(0, 1 - Math.abs((sound_x - viewer_x + edge_w) / Defines.OLD_SCREEN_WIDTH)),
      (this._muted ? 0 : this._volume) * Math.max(0, 1 - Math.abs((sound_x - viewer_x - edge_w) / Defines.OLD_SCREEN_WIDTH))
    ]
  }
  play(name: string, x?: number, y?: number, z?: number): string {
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

  stop(id: string): void {
    const n = this._playings.get(id);
    if (!n) return;
    n.src_node.stop();
    this._playings.delete(id)
  }

  dispose(): void {
    this._r.clean();
    this._playings.forEach(v => v.src_node.stop())
    this._playings.clear();
  }
}
