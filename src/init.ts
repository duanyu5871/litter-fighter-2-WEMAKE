import "current-device";
import * as THREE from "three";
import * as dom from "./DittoImpl";
import { __Billboard, __Camera_O, __Camera_P, __LineSegments, __Object, __Scene, __Text } from "./DittoImpl/3d";
import { __Mesh } from "./DittoImpl/3d/__Mesh";
import __Sprite from "./DittoImpl/3d/__Sprite";
import { BgLayerRender } from "./DittoImpl/renderer/BgLayerRender";
import { BgRender } from "./DittoImpl/renderer/BgRender";
import { EntityShadowRender } from "./DittoImpl/renderer/EntityShadowRender";
import Ditto from "./LF2/ditto";
import { EntityInfoRender } from "./DittoImpl/renderer/EntityInfoRender";

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
  SceneNode: __Scene,
  OrthographicCamera: __Camera_O,
  PerspectiveCamera: __Camera_P,
  SpriteNode: __Sprite,
  LineSegmentsNode: __LineSegments,
  MeshNode: __Mesh,
  BillboardNode: __Billboard,
  Vector3: THREE.Vector3,
  Vector2: THREE.Vector2,
  Quaternion: THREE.Quaternion,
  Raycaster: THREE.Raycaster,
  BgLayerRender: BgLayerRender,
  BgRender: BgRender,
  EntityShadowRender: EntityShadowRender,
  EntityInfoRender: EntityInfoRender,
});
