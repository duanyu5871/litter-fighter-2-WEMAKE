import "current-device";
import * as THREE from "three";
import * as dom from "./DittoImpl";
import { __Billboard, __Camera_O, __Camera_P, __LineSegments, __Object, __Text } from "./DittoImpl/3d";
import { __Mesh } from "./DittoImpl/3d/__Mesh";
import __Sprite from "./DittoImpl/3d/__Sprite";
import { UINodeRenderer } from "./DittoImpl/renderer/UINodeRenderer";
import { WorldRenderer } from "./DittoImpl/renderer/WorldRenderer";
import { Ditto } from "./LF2/ditto";
import { Debug, Log, Warn } from "./Log";

Ditto.setup({
  Timeout: dom.__Timeout,
  Interval: dom.__Interval,
  Render: dom.__Render,
  Keyboard: dom.__Keyboard,
  Pointings: dom.__Pointings,
  FullScreen: dom.__FullScreen,
  Sounds: dom.__Sounds,
  Cache: dom.__Cache,
  Zip: dom.__Zip,
  MD5: dom.__MD5,
  Importer: new dom.__Importer(),
  ObjectNode: __Object,
  TextNode: __Text,
  OrthographicCamera: __Camera_O,
  PerspectiveCamera: __Camera_P,
  SpriteNode: __Sprite,
  BillboardNode: __Billboard,
  Vector3: THREE.Vector3,
  Vector2: THREE.Vector2,
  Quaternion: THREE.Quaternion,
  Raycaster: THREE.Raycaster,
  WorldRender: WorldRenderer,
  UINodeRenderer: UINodeRenderer,
  warn: Warn.print,
  Log: Log.print,
  debug: Debug.print,
  get DEV(): boolean {
    const { hostname, search, hash } = window.location
    return hostname.startsWith('localhost') ? (
      !search.startsWith('?NO_DEV') && !hash.startsWith('#NO_DEV')
    ) : (
      search.startsWith('?DEV') || hash.startsWith('#DEV')
    )
  }
});
