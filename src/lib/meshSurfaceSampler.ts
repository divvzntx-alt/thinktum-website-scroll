import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

export async function samplePointsFromFBX(
  url: string,
  count: number
): Promise<{ positions: Float32Array; bounds: THREE.Box3 }> {
  const loader = new FBXLoader();

  const group = await new Promise<THREE.Group>((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });

  const meshes: THREE.Mesh[] = [];
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshes.push(child as THREE.Mesh);
    }
  });

  if (meshes.length === 0) {
    throw new Error(`No meshes found in FBX file: ${url}`);
  }

  const samplers: { sampler: MeshSurfaceSampler; area: number }[] = [];
  let totalArea = 0;

  for (const mesh of meshes) {
    mesh.updateWorldMatrix(true, false);
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);

    const tempMesh = new THREE.Mesh(geometry);
    const sampler = new MeshSurfaceSampler(tempMesh).build();

    const box = new THREE.Box3().setFromBufferAttribute(
      geometry.getAttribute("position") as THREE.BufferAttribute
    );
    const size = box.getSize(new THREE.Vector3());
    const area = size.x * size.y + size.y * size.z + size.x * size.z;

    samplers.push({ sampler, area });
    totalArea += area;
  }

  const positions = new Float32Array(count * 3);
  const tempPos = new THREE.Vector3();
  let idx = 0;

  for (const { sampler, area } of samplers) {
    const meshCount = Math.round((area / totalArea) * count);
    for (let i = 0; i < meshCount && idx < count; i += 1) {
      sampler.sample(tempPos);
      positions[idx * 3] = tempPos.x;
      positions[idx * 3 + 1] = tempPos.y;
      positions[idx * 3 + 2] = tempPos.z;
      idx += 1;
    }
  }

  while (idx < count) {
    samplers[0].sampler.sample(tempPos);
    positions[idx * 3] = tempPos.x;
    positions[idx * 3 + 1] = tempPos.y;
    positions[idx * 3 + 2] = tempPos.z;
    idx += 1;
  }

  const bounds = new THREE.Box3();
  for (let i = 0; i < count; i += 1) {
    bounds.expandByPoint(
      new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      )
    );
  }

  return { positions, bounds };
}

export function normalizePositions(
  positions: Float32Array,
  bounds: THREE.Box3,
  targetScale = 15
): Float32Array {
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetScale / Math.max(maxDim, 0.0001);

  const normalized = new Float32Array(positions.length);
  for (let i = 0; i < positions.length / 3; i += 1) {
    normalized[i * 3] = (positions[i * 3] - center.x) * scale;
    normalized[i * 3 + 1] = (positions[i * 3 + 1] - center.y) * scale;
    normalized[i * 3 + 2] = (positions[i * 3 + 2] - center.z) * scale;
  }

  return normalized;
}
