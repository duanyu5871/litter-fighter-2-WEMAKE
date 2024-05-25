import * as THREE from "three";
import Node from "./Node";

export default class Scene extends Node {
  protected _inner: THREE.Scene = new THREE.Scene();
}

export class Camera_O extends Node {
  protected _inner: THREE.OrthographicCamera = new THREE.OrthographicCamera();
}