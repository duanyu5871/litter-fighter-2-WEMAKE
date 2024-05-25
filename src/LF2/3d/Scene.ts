import * as THREE from "three";
import Node from "./Node";

export default class Scene extends Node {
  override get inner(): THREE.Scene { return this._inner as THREE.Scene }
  
  constructor() {
    super();
    this._inner = new THREE.Scene();
  }
}

