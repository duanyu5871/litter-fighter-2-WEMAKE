import type { ICache } from "./cache";
import type { IFullScreen } from "./fullscreen";
import type { IRender } from "./IRender";
import type { ITimeout } from "./ITimeout";
import type { IKeyboard } from "./keyboard/IKeyboard";
import type { IPointings } from "./pointings";
import type ISounds from "./sounds/ISounds";
import type { IZip } from "./zip/IZip";
export * from "./cache";
export * from "./fullscreen";
export * from "./IRender";
export * from "./ITimeout";
export * from "./keyboard";
export * from "./pointings";
export * from "./zip";
export * from "./sounds";

export interface IDittoPack {
  readonly Timeout: ITimeout;
  readonly Interval: ITimeout;
  readonly Render: IRender;
  readonly MD5: (...args: string[]) => string;
  readonly Zip: {
    read_file(file: File): Promise<IZip>;
    read_buf(buf: Uint8Array): Promise<IZip>;
    download(url: string, on_progress: (progress: number, size: number) => void): Promise<IZip>;
  }
  readonly Sounds: new (...args: any[]) => ISounds;
  readonly Keyboard: new (...args: any[]) => IKeyboard;
  readonly Pointings: new (...args: any[]) => IPointings;
  readonly FullScreen: new (...args: any[]) => IFullScreen;
  readonly Cache: ICache;
  setup(pack: Omit<IDittoPack, 'setup'>): void;
  [key: string]: any;
}
export default {
  setup(pack: Omit<IDittoPack, 'setup'>) {
    for (const k in pack) {
      const key = k as keyof IDittoPack;
      this[key] = pack[k];
    }
  },
} as IDittoPack;