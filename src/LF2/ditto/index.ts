import type { ILineSegmentsInfo, ILineSegmentsNode } from "../3d";
import type { IBillboardInfo, IBillboardNode } from "../3d/IBillboard";
import type { IMeshInfo, IMeshNode } from "../3d/IMesh";
import type { IObjectNode } from "../3d/IObject";
import type { IOrthographicCameraNode } from "../3d/IOrthographicCamera";
import type { IPerspectiveCamera } from "../3d/IPerspectiveCamera";
import type { ISprite, ISpriteInfo } from "../3d/ISprite";
import type { IText } from "../3d/IText";
import type { Layer } from "../bg/Layer";
import type { IQuaternion, IVector2, IVector3 } from "../defines";
import type { IRaycaster } from "../defines/IRaycaster";
import type { Entity } from "../entity/Entity";
import type { LF2 } from "../LF2";
import type { UINode } from "../ui/UINode";
import type { World } from "../World";
import type { ICache } from "./cache";
import type { IFullScreen } from "./fullscreen";
import { BaseImporter, type IImporter } from "./importer";
import type { IRender } from "./IRender";
import type { ITimeout } from "./ITimeout";
import type { IKeyboard } from "./keyboard/IKeyboard";
import type { IPointings } from "./pointings";
import type { IUINodeRenderer } from "./render/IUINodeRenderer";
import type { IWorldRenderer } from "./render/IWorldRenderer";
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
  TextNode: new (lf2: LF2) => IText;
  OrthographicCamera: new (lf2: LF2) => IOrthographicCameraNode;
  PerspectiveCamera: new (lf2: LF2) => IPerspectiveCamera;
  SpriteNode: new (lf2: LF2, info?: ISpriteInfo) => ISprite;
  LineSegmentsNode: new (
    lf2: LF2,
    info?: ILineSegmentsInfo,
  ) => ILineSegmentsNode;
  MeshNode: new (lf2: LF2, info?: IMeshInfo) => IMeshNode;
  BillboardNode: new (lf2: LF2, info?: IBillboardInfo) => IBillboardNode;
  Vector3: new (x?: number, y?: number, z?: number) => IVector3;
  Vector2: new (x?: number, y?: number) => IVector2;
  Raycaster: new () => IRaycaster;
  Quaternion: new (x?: number, y?: number, z?: number, w?: number) => IQuaternion;
  WorldRender: new (world: World) => IWorldRenderer,
  UINodeRenderer: new (uinode: UINode) => IUINodeRenderer,
  Warn(...args: any[]): unknown;
  Log(...args: any[]): unknown;
  Debug(...args: any[]): unknown;
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
