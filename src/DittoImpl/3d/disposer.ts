import type * as THREE from "./_t";
const isMeshBasicMaterial = (v: any): v is THREE.MeshBasicMaterial =>
  true === v.isMeshBasicMaterial;

export function dispose_material(m: THREE.Material) {
  if (isMeshBasicMaterial(m)) m.map?.dispose();
  m.dispose();
}
export function dispose_mesh(mesh: THREE.Mesh) {
  mesh.removeFromParent();
  const m = mesh.material;
  if (Array.isArray(m)) for (const i of m) dispose_material(i);
  else dispose_material(m);
  mesh.geometry.dispose();
}
