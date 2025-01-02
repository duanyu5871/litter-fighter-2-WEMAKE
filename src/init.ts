import "current-device";
import * as THREE from "three";
import * as dom from "./DittoImpl";
import { __Camera_O_Node, __ObjectNode, __SceneNode, __Text } from "./DittoImpl/3d";
import { __Camera_P_Node } from "./DittoImpl/3d/__Camera_P_Node";
import { __LineSegmentsNode } from "./DittoImpl/3d/LineSegmentsNode";
import { __MeshNode } from "./DittoImpl/3d/MeshNode";
import __SpriteNode from "./DittoImpl/3d/SpriteNode";
import { __BillboardNode } from "./DittoImpl/BillboardNode";
import Ditto from "./LF2/ditto";

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
  ObjectNode: __ObjectNode,
  TextNode: __Text,
  SceneNode: __SceneNode,
  OrthographicCamera: __Camera_O_Node,
  PerspectiveCamera: __Camera_P_Node,
  SpriteNode: __SpriteNode,
  LineSegmentsNode: __LineSegmentsNode,
  MeshNode: __MeshNode,
  BillboardNode: __BillboardNode,
  Vector3: THREE.Vector3,
  Vector2: THREE.Vector2,
});
