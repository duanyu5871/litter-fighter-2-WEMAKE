import axios from "axios";
import { Defines } from "../../../common/lf2_type/defines";
import type LF2 from "../../LF2";
import AsyncValuesKeeper from "../../base/AsyncValuesKeeper";
import { IPlayer } from "../../sound/IPlayer";

export default class ModernPlayer implements IPlayer {
  readonly ctx = new AudioContext();
  readonly lf2: LF2;
  protected _req_id: number = 0;
  protected _prev_bgm_url: string | null = null;
  protected _bgm_src_node: AudioBufferSourceNode | null = null;

  protected _r = new AsyncValuesKeeper<AudioBuffer>();
  protected _bgm: string | null = null;
  protected _sound_id = 0;
  protected _playings = new Map<string, AudioBufferSourceNode>()
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }

  bgm(): string | null {
    return this._bgm;
  }

  has(name: string): boolean {
    return this._r.values.has(name);
  }

  preload(name: string, src: string) {
    return this._r.get(name, async () => {
      this.lf2.on_loading_content(`loading sound: ${name}`, 0);
      const url = await this.lf2.import_sound(src);
      const buf = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' })
        .then(v => this.ctx.decodeAudioData(v.data));
      this.lf2.on_loading_content(`loading sound: ${name}`, 100);
      return buf
    })
  }

  stop_bgm() {
    if (!this._bgm_src_node) return;
    this._bgm = null;
    this._bgm_src_node.stop();
    this._prev_bgm_url = null;
  }

  play_bgm(name: string, restart?: boolean | undefined): () => void {
    if (!restart && this._prev_bgm_url === name) return () => { };
    this.stop_bgm();

    this._bgm = name;
    this._prev_bgm_url = name;
    ++this._req_id;

    const req_id = this._req_id;
    const ctx = this.ctx;
    const buf = this._r.values.get(name);
    const start = (buf: AudioBuffer) => {
      this._bgm_src_node = ctx.createBufferSource();
      this._bgm_src_node.buffer = buf;
      this._bgm_src_node.connect(ctx.destination);
      this._bgm_src_node.start();
    };
    if (buf) {
      start(buf);
    } else {
      this.preload(name, name).then(start)
    }
    return () => (req_id === this._req_id) && this.stop_bgm();
  }

  play(name: string, x?: number, y?: number, z?: number): string {
    const buf = this._r.values.get(name);
    if (!buf) return '';

    const edge_w = Defines.OLD_SCREEN_WIDTH / 2;
    const viewer_x = this.lf2.world.camera.position.x + edge_w;
    const sound_x = x ?? viewer_x;
    const l_vol = Math.max(0, 1 - Math.abs((sound_x - viewer_x + edge_w) / Defines.OLD_SCREEN_WIDTH));
    const r_vol = Math.max(0, 1 - Math.abs((sound_x - viewer_x - edge_w) / Defines.OLD_SCREEN_WIDTH));

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
    this._playings.set(id, src_node)
    src_node.onended = () => this._playings.delete(id);
    return id;
  }

  stop(id: string): void {
    const n = this._playings.get(id);
    if (!n) return;
    n.stop();
    this._playings.delete(id)
  }

  dispose(): void {
    this._r.clean();
    this._playings.forEach(v => v.stop())
    this._playings.clear();
  }
}
