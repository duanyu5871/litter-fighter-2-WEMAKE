import { ILineSegmentsInfo, ILineSegmentsNode } from "../3d";
import { IBillboardInfo, IBillboardNode } from "../3d/IBillboardNode";
import { IMeshInfo, IMeshNode } from "../3d/IMeshNode";
import type { IObjectNode } from "../3d/IObjectNode";
import { IOrthographicCameraNode } from "../3d/IOrthographicCamera";
import { IPerspectiveCamera } from "../3d/IPerspectiveCamera";
import { ISceneNode } from "../3d/ISceneNode";
import { ISpriteInfo, ISpriteNode } from "../3d/ISpriteNode";
import { ITextNode } from "../3d/ITextNode";
import type LF2 from "../LF2";
import type { ICache } from "./cache";
import type { IFullScreen } from "./fullscreen";
import { BaseImporter, type IImporter } from "./importer";
import type { IRender } from "./IRender";
import type { ITimeout } from "./ITimeout";
import { IVector2 } from "./IVector2";
import { IVector3 } from "./IVector3";
import { IQuaternion } from "./IQuaternion";
import type { IKeyboard } from "./keyboard/IKeyboard";
import type { IPointings } from "./pointings";
import BaseSounds from "./sounds/BaseSounds";
import type ISounds from "./sounds/ISounds";
import type { IZip } from "./zip/IZip";
export * from "./cache";
export * from "./fullscreen";
export * from "./IRender";
export * from "./ITimeout";
export * from "./keyboard";
export * from "./pointings";
export * from "./sounds";
export * from "./zip";

export interface IDittoPack {
  Timeout: ITimeout;
  Interval: ITimeout;
  Render: IRender;
  MD5: (...args: string[]) => string;
  Zip: {
    read_file(file: File): Promise<IZip>;
    read_buf(name: string, buf: Uint8Array): Promise<IZip>;
    download(
      url: string,
      on_progress: (progress: number, size: number) => void,
    ): Promise<IZip>;
  };
  Sounds: new (...args: any[]) => ISounds;
  Keyboard: new (...args: any[]) => IKeyboard;
  Pointings: new (...args: any[]) => IPointings;
  FullScreen: new (...args: any[]) => IFullScreen;
  Importer: IImporter;
  Cache: ICache;

  ObjectNode: new (lf2: LF2) => IObjectNode;
  TextNode: new (lf2: LF2) => ITextNode;
  SceneNode: new (lf2: LF2, canvas: HTMLCanvasElement) => ISceneNode;
  OrthographicCamera: new (lf2: LF2) => IOrthographicCameraNode;
  PerspectiveCamera: new (lf2: LF2) => IPerspectiveCamera;
  SpriteNode: new (lf2: LF2, info?: ISpriteInfo) => ISpriteNode;
  LineSegmentsNode: new (
    lf2: LF2,
    info?: ILineSegmentsInfo,
  ) => ILineSegmentsNode;
  MeshNode: new (lf2: LF2, info?: IMeshInfo) => IMeshNode;
  BillboardNode: new (lf2: LF2, info?: IBillboardInfo) => IBillboardNode;
  Vector3: new (x?: number, y?: number, z?: number) => IVector3;
  Vector2: new (x?: number, y?: number) => IVector2;
  Quaternion: new (x?: number, y?: number, z?: number, w?: number) => IQuaternion;
}

export interface IDitto extends IDittoPack {
  setup(pack: IDittoPack): void;
}
const Ditto: Partial<IDitto> = {
  Importer: new BaseImporter(),
  Sounds: BaseSounds,
  setup(pack: IDittoPack) {
    Object.assign(this, pack);
  },
};
export default Ditto as IDitto;
