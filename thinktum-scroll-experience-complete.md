# Thinktum Scroll Experience — Complete Build Package

Everything needed to rebuild this project from scratch.

---

## Prerequisites

**Framework:** React 18 + Vite 5 + TypeScript  
**Key dependencies:** `three@0.136.0`, `@types/three@0.136.1`  
**Path alias:** `@/` → `src/` (configured in vite.config.ts / tsconfig)

## Assets (must be placed in `public/models/`)
- `tree.fbx` — autumn tree model (~222KB)
- `tunnel.fbx` — tunnel model (~2.1MB)  
- `city.fbx` — city model (~1.4MB)

## index.html — Add to `<head>`
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

## Entry point: `src/pages/Index.tsx`
```tsx
import ScrollExperience from "@/components/thinktum/ScrollExperience";

const Index = () => {
  return <ScrollExperience />;
};

export default Index;
```

---

## File 1: `src/lib/meshSurfaceSampler.ts`

This utility loads FBX 3D models and samples particle positions from their surfaces.

```ts
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

/**
 * Load an FBX file and sample `count` points from its mesh surfaces.
 * Returns a Float32Array of [x, y, z, x, y, z, ...] positions.
 */
export async function samplePointsFromFBX(
  url: string,
  count: number
): Promise<{ positions: Float32Array; bounds: THREE.Box3 }> {
  const loader = new FBXLoader();

  const group = await new Promise<THREE.Group>((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });

  // Collect all meshes from the loaded group
  const meshes: THREE.Mesh[] = [];
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshes.push(child as THREE.Mesh);
    }
  });

  if (meshes.length === 0) {
    throw new Error("No meshes found in FBX file");
  }

  // Calculate total surface area to distribute points proportionally
  const samplers: { sampler: MeshSurfaceSampler; area: number }[] = [];
  let totalArea = 0;

  for (const mesh of meshes) {
    // Apply world transform to geometry
    mesh.updateWorldMatrix(true, false);
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);

    const tempMesh = new THREE.Mesh(geo);
    const sampler = new MeshSurfaceSampler(tempMesh).build();

    // Estimate area from bounding box (rough but fine for distribution)
    const box = new THREE.Box3().setFromBufferAttribute(
      geo.getAttribute("position") as THREE.BufferAttribute
    );
    const size = box.getSize(new THREE.Vector3());
    const area = size.x * size.y + size.y * size.z + size.x * size.z;

    samplers.push({ sampler, area });
    totalArea += area;
  }

  // Sample points proportionally
  const positions = new Float32Array(count * 3);
  const tempPos = new THREE.Vector3();
  let idx = 0;

  for (const { sampler, area } of samplers) {
    const meshCount = Math.round((area / totalArea) * count);
    for (let i = 0; i < meshCount && idx < count; i++) {
      sampler.sample(tempPos);
      positions[idx * 3] = tempPos.x;
      positions[idx * 3 + 1] = tempPos.y;
      positions[idx * 3 + 2] = tempPos.z;
      idx++;
    }
  }

  // Fill remaining points (rounding errors) from first sampler
  while (idx < count) {
    samplers[0].sampler.sample(tempPos);
    positions[idx * 3] = tempPos.x;
    positions[idx * 3 + 1] = tempPos.y;
    positions[idx * 3 + 2] = tempPos.z;
    idx++;
  }

  // Calculate bounds for normalization
  const bounds = new THREE.Box3();
  for (let i = 0; i < count; i++) {
    bounds.expandByPoint(
      new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
    );
  }

  return { positions, bounds };
}

/**
 * Normalize and center sampled positions to fit within a target scale.
 * Centers at origin and scales so the largest dimension = targetScale.
 */
export function normalizePositions(
  positions: Float32Array,
  bounds: THREE.Box3,
  targetScale: number = 15
): Float32Array {
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetScale / maxDim;

  const count = positions.length / 3;
  const normalized = new Float32Array(positions.length);

  for (let i = 0; i < count; i++) {
    normalized[i * 3] = (positions[i * 3] - center.x) * scale;
    normalized[i * 3 + 1] = (positions[i * 3 + 1] - center.y) * scale;
    normalized[i * 3 + 2] = (positions[i * 3 + 2] - center.z) * scale;
  }

  return normalized;
}
```

---

## File 2: `src/components/thinktum/beatConfig.ts`

Defines the 12-beat narrative structure, card data, and scroll weights.

```ts
/** Beat configuration — narrative, copy, camera, and morph targets */

export interface BeatConfig {
  id: number;
  /** Formation name for particle morph target */
  formation: string;
  headline: string;
  support: string;
  /** Scroll-height multiplier (1 = 100vh per beat) */
  scrollWeight: number;
}

export const TOTAL_BEATS = 12; // entry + 10 beats + city finale

export const beats: BeatConfig[] = [
  {
    id: 0,
    formation: "planet",
    headline: "",
    support: "",
    scrollWeight: 1,
  },
  {
    id: 1,
    formation: "grid",
    headline: "The industry was built for a different world.",
    support: "Rigid. Fixed. Built like buildings — walls, floors, departments that don't talk.",
    scrollWeight: 1.5,
  },
  {
    id: 2,
    formation: "spheres",
    headline: "Then everything accelerated.",
    support: "AI. Data. Customer expectations that won't wait.",
    scrollWeight: 1,
  },
  {
    id: 3,
    formation: "continents",
    headline: "Disconnected systems. Disconnected teams.",
    support: "Fragmented rules. Speed measured in months, not days.",
    scrollWeight: 1.2,
  },
  {
    id: 4,
    formation: "rain",
    headline: "The gap became impossible to ignore.",
    support: "The buildings couldn't move.",
    scrollWeight: 1,
  },
  {
    id: 5,
    formation: "trunk",
    headline: "Not built. Grown.",
    support: "Nature solved this problem a long time ago.",
    scrollWeight: 1.2,
  },
  {
    id: 6,
    formation: "branches",
    headline: "A system finding its shape.",
    support: "Invisible roots. Modular branches. Grows exactly where it's needed.",
    scrollWeight: 1.2,
  },
  {
    id: 7,
    formation: "tree",
    headline: "LIZ was built for this moment.",
    support: "The most resilient infrastructure ever built doesn't look like a machine.",
    scrollWeight: 1.5,
  },
  {
    id: 8,
    formation: "treeOrbit",
    headline: "LIZ is built on the same logic.",
    support: "Flow. Assess. Data. Each branch growing where your business needs it.",
    scrollWeight: 2,
  },
  {
    id: 9,
    formation: "roots",
    headline: "Not to replace. To connect.",
    support: "Foundation forming beneath everything you see.",
    scrollWeight: 1.2,
  },
  {
    id: 10,
    formation: "tunnel",
    headline: "You are now inside it.",
    support: "This is what your infrastructure feels like when everything connects.",
    scrollWeight: 2.5,
  },
  {
    id: 11,
    formation: "city",
    headline: "Insurance built for the age of AI.",
    support: "",
    scrollWeight: 2,
  },
];

/** Cards that appear during Beat 08 — orbital walk */
export interface BeatCard {
  title: string;
  body: string;
  cta: string;
  /** Progress within the beat (0–1) when card appears */
  appearAt: number;
  /** Progress when card disappears */
  disappearAt: number;
  side: "left" | "right";
}

export const lizCards: BeatCard[] = [
  {
    title: "liz flow",
    body: "Build any customer journey.\nNo code. No waiting.",
    cta: "Explore Flow →",
    appearAt: 0.05,
    disappearAt: 0.35,
    side: "left",
  },
  {
    title: "liz assess",
    body: "Hyper-personalised underwriting rules.\nInstant deployment.",
    cta: "Explore Assess →",
    appearAt: 0.35,
    disappearAt: 0.65,
    side: "right",
  },
  {
    title: "liz data",
    body: "Real-time analytics.\nEvery decision visible.",
    cta: "Explore Data →",
    appearAt: 0.65,
    disappearAt: 0.95,
    side: "left",
  },
];

/** Cards that appear during Beat 10 — tunnel walkthrough */
export const tunnelCards: BeatCard[] = [
  {
    title: "Insurance Carriers",
    body: "Core infrastructure, reimagined.",
    cta: "Learn more →",
    appearAt: 0.05,
    disappearAt: 0.2,
    side: "left",
  },
  {
    title: "Insurance Providers",
    body: "Speed to market, finally possible.",
    cta: "Learn more →",
    appearAt: 0.2,
    disappearAt: 0.35,
    side: "right",
  },
  {
    title: "Distribution Groups",
    body: "Every channel, one system.",
    cta: "Learn more →",
    appearAt: 0.35,
    disappearAt: 0.5,
    side: "left",
  },
  {
    title: "Insurtechs",
    body: "Built to move fast. LIZ moves with you.",
    cta: "Learn more →",
    appearAt: 0.5,
    disappearAt: 0.65,
    side: "right",
  },
  {
    title: "Reinsurers",
    body: "Complexity managed. Clarity delivered.",
    cta: "Learn more →",
    appearAt: 0.65,
    disappearAt: 0.8,
    side: "left",
  },
  {
    title: "All Industries",
    body: "One platform. Every journey.",
    cta: "Learn more →",
    appearAt: 0.8,
    disappearAt: 0.95,
    side: "right",
  },
];
```

---

## File 3: `src/components/thinktum/useScrollProgress.ts`

Custom hook that maps scroll position to beat index, local progress, and counter.

```ts
import { useEffect, useState, useCallback, useRef } from "react";
import { beats, TOTAL_BEATS } from "./beatConfig";

export interface ScrollState {
  /** Overall scroll progress 0–1 */
  globalProgress: number;
  /** Current beat index */
  beatIndex: number;
  /** Progress within current beat 0–1 */
  localProgress: number;
  /** Formatted counter string e.g. "08/10" */
  counter: string;
}

const totalWeight = beats.reduce((s, b) => s + b.scrollWeight, 0);

export function getScrollState(scrollY: number, scrollHeight: number): ScrollState {
  const maxScroll = Math.max(1, scrollHeight);
  const globalProgress = Math.min(scrollY / maxScroll, 1);

  // Map global progress to beat
  let accumulated = 0;
  let beatIndex = 0;
  let localProgress = 0;

  for (let i = 0; i < beats.length; i++) {
    const beatFraction = beats[i].scrollWeight / totalWeight;
    if (globalProgress <= accumulated + beatFraction) {
      beatIndex = i;
      localProgress = (globalProgress - accumulated) / beatFraction;
      break;
    }
    accumulated += beatFraction;
    if (i === beats.length - 1) {
      beatIndex = i;
      localProgress = 1;
    }
  }

  // Counter: beats 1–10 shown as 01/10 .. 10/10, entry=00, city=10
  const displayBeat = Math.min(Math.max(beatIndex, 0), TOTAL_BEATS - 1);
  const counterNum = Math.min(displayBeat, 10);
  const counter = `${String(counterNum).padStart(2, "0")}/10`;

  return { globalProgress, beatIndex, localProgress, counter };
}

export function useScrollProgress(scrollRef: React.RefObject<HTMLDivElement | null>): ScrollState {
  const [state, setState] = useState<ScrollState>({
    globalProgress: 0,
    beatIndex: 0,
    localProgress: 0,
    counter: "00/10",
  });
  const rafRef = useRef<number>(0);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const scrollY = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setState(getScrollState(scrollY, scrollHeight));
    });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scrollRef, onScroll]);

  return state;
}
```

---

## File 4: `src/components/thinktum/ParticleScene.tsx`

The core Three.js scene — 80k particles with 11 morph targets, custom shaders, and scroll-driven camera paths.

```tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { samplePointsFromFBX, normalizePositions } from "@/lib/meshSurfaceSampler";
import type { ScrollState } from "./useScrollProgress";

const PARTICLE_COUNT = 80000;

interface ParticleSceneProps {
  scrollState: ScrollState;
}

const ParticleScene = ({ scrollState }: ParticleSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollState);
  scrollRef.current = scrollState;

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080810);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Uniforms
    const gu = {
      time: { value: 0 },
      morphProgress: { value: 0 },
      morphTarget: { value: 0 }, // 0=galaxy,1=grid,2=spheres,3=continents,4=rain,5=trunk,6=branches,7=tree,8=treeOrbit,9=roots,10=tunnel,11=city
      beatLocal: { value: 0 },
    };

    // Galaxy base positions
    const sizes: number[] = [];
    const shift: number[] = [];
    const pushShift = () => {
      shift.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
      );
    };

    // Galaxy sphere particles
    const galaxyPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < 30000; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 0.5 + 9.5);
      galaxyPositions[i * 3] = v.x;
      galaxyPositions[i * 3 + 1] = v.y;
      galaxyPositions[i * 3 + 2] = v.z;
      sizes.push(Math.random() * 1.5 + 0.5);
      pushShift();
    }
    for (let i = 30000; i < PARTICLE_COUNT; i++) {
      const r = 10, R = 40;
      const rand = Math.pow(Math.random(), 1.5);
      const radius = Math.sqrt(R * R * rand + (1 - rand) * r * r);
      const angle = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * 2;
      galaxyPositions[i * 3] = Math.cos(angle) * radius;
      galaxyPositions[i * 3 + 1] = y;
      galaxyPositions[i * 3 + 2] = Math.sin(angle) * radius;
      sizes.push(Math.random() * 1.5 + 0.5);
      pushShift();
    }

    // Grid positions — silk wave
    const gridPositions = new Float32Array(PARTICLE_COUNT * 3);
    const gridSize = 60;
    const gridSide = Math.ceil(Math.sqrt(PARTICLE_COUNT));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i % gridSide;
      const iz = Math.floor(i / gridSide);
      gridPositions[i * 3] = (ix / gridSide - 0.5) * gridSize;
      gridPositions[i * 3 + 1] = 0;
      gridPositions[i * 3 + 2] = (iz / gridSide - 0.5) * gridSize;
    }

    // Spheres positions — 6 isolated spheres
    const spherePositions = new Float32Array(PARTICLE_COUNT * 3);
    const sphereCenters = [
      [-12, 5, -5], [10, -3, 8], [-5, -7, -10],
      [8, 8, -8], [-10, 0, 10], [12, -5, -3],
    ];
    const perSphere = Math.floor(PARTICLE_COUNT / 6);
    for (let s = 0; s < 6; s++) {
      const [cx, cy, cz] = sphereCenters[s];
      for (let j = 0; j < perSphere; j++) {
        const idx = s * perSphere + j;
        if (idx >= PARTICLE_COUNT) break;
        const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 2.5 + 0.5);
        spherePositions[idx * 3] = cx + v.x;
        spherePositions[idx * 3 + 1] = cy + v.y;
        spherePositions[idx * 3 + 2] = cz + v.z;
      }
    }
    // Fill remaining
    for (let i = perSphere * 6; i < PARTICLE_COUNT; i++) {
      const s = i % 6;
      const [cx, cy, cz] = sphereCenters[s];
      const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 2.5 + 0.5);
      spherePositions[i * 3] = cx + v.x;
      spherePositions[i * 3 + 1] = cy + v.y;
      spherePositions[i * 3 + 2] = cz + v.z;
    }

    // Continent positions — flat abstract shapes on XZ plane
    const continentPositions = new Float32Array(PARTICLE_COUNT * 3);
    // Simple continent-ish blobs using polar shapes
    const continentShapes = [
      { cx: -15, cz: -5, rx: 8, rz: 5 },  // "Americas"
      { cx: 5, cz: -6, rx: 5, rz: 7 },     // "Europe/Africa"
      { cx: 18, cz: 2, rx: 7, rz: 5 },     // "Asia"
      { cx: 20, cz: 10, rx: 4, rz: 3 },    // "Oceania"
      { cx: -5, cz: 8, rx: 3, rz: 2 },     // small island
    ];
    const perContinent = Math.floor(PARTICLE_COUNT / continentShapes.length);
    for (let c = 0; c < continentShapes.length; c++) {
      const shape = continentShapes[c];
      for (let j = 0; j < perContinent; j++) {
        const idx = c * perContinent + j;
        if (idx >= PARTICLE_COUNT) break;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random());
        continentPositions[idx * 3] = shape.cx + Math.cos(angle) * r * shape.rx;
        continentPositions[idx * 3 + 1] = 0;
        continentPositions[idx * 3 + 2] = shape.cz + Math.sin(angle) * r * shape.rz;
      }
    }
    for (let i = perContinent * continentShapes.length; i < PARTICLE_COUNT; i++) {
      const c = i % continentShapes.length;
      const shape = continentShapes[c];
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      continentPositions[i * 3] = shape.cx + Math.cos(angle) * r * shape.rx;
      continentPositions[i * 3 + 1] = 0;
      continentPositions[i * 3 + 2] = shape.cz + Math.sin(angle) * r * shape.rz;
    }

    // Rain positions — everything falls straight down
    const rainPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 50;
      rainPositions[i * 3 + 1] = -15 + Math.random() * 5;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    const init = async () => {
      try {
        const [treeResult, tunnelResult, cityResult] = await Promise.all([
          samplePointsFromFBX("/models/tree.fbx", PARTICLE_COUNT),
          samplePointsFromFBX("/models/tunnel.fbx", PARTICLE_COUNT),
          samplePointsFromFBX("/models/city.fbx", PARTICLE_COUNT),
        ]);

        if (disposed) return;

        const treePositions = normalizePositions(treeResult.positions, treeResult.bounds, 15);
        const tunnelPositions = normalizePositions(tunnelResult.positions, tunnelResult.bounds, 20);
        const cityPositions = normalizePositions(cityResult.positions, cityResult.bounds, 15);

        // Derive trunk/branches/roots from tree
        const treeBounds = new THREE.Box3();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          treeBounds.expandByPoint(new THREE.Vector3(treePositions[i*3], treePositions[i*3+1], treePositions[i*3+2]));
        }
        const treeMin = treeBounds.min.y;
        const treeHeight = treeBounds.max.y - treeBounds.min.y;

        // Trunk = bottom 40% of tree, branches = middle, full = all
        const trunkPositions = new Float32Array(PARTICLE_COUNT * 3);
        const branchPositions = new Float32Array(PARTICLE_COUNT * 3);
        const rootPositions = new Float32Array(PARTICLE_COUNT * 3);

        // Sort particles by height to assign them
        const heightIndices: { idx: number; h: number }[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          heightIndices.push({ idx: i, h: (treePositions[i*3+1] - treeMin) / treeHeight });
        }

        // Trunk: particles from bottom 40%, others collapse to ground line
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const relH = (treePositions[i*3+1] - treeMin) / treeHeight;
          if (relH < 0.4) {
            trunkPositions[i*3] = treePositions[i*3];
            trunkPositions[i*3+1] = treePositions[i*3+1];
            trunkPositions[i*3+2] = treePositions[i*3+2];
          } else {
            // Stack below the trunk base
            trunkPositions[i*3] = treePositions[i*3] * 0.3;
            trunkPositions[i*3+1] = treeMin + Math.random() * treeHeight * 0.05;
            trunkPositions[i*3+2] = treePositions[i*3+2] * 0.3;
          }
        }

        // Branches: bottom 70% (trunk + branches, no canopy)
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const relH = (treePositions[i*3+1] - treeMin) / treeHeight;
          if (relH < 0.7) {
            branchPositions[i*3] = treePositions[i*3];
            branchPositions[i*3+1] = treePositions[i*3+1];
            branchPositions[i*3+2] = treePositions[i*3+2];
          } else {
            // Pull into branch tips
            branchPositions[i*3] = treePositions[i*3] * 0.6;
            branchPositions[i*3+1] = treeMin + treeHeight * 0.5 + Math.random() * treeHeight * 0.2;
            branchPositions[i*3+2] = treePositions[i*3+2] * 0.6;
          }
        }

        // Roots: mirror bottom part of tree below ground
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const relH = (treePositions[i*3+1] - treeMin) / treeHeight;
          if (relH < 0.3) {
            rootPositions[i*3] = treePositions[i*3] * 1.3;
            rootPositions[i*3+1] = treeMin - (treePositions[i*3+1] - treeMin) * 1.5;
            rootPositions[i*3+2] = treePositions[i*3+2] * 1.3;
          } else {
            rootPositions[i*3] = treePositions[i*3];
            rootPositions[i*3+1] = treePositions[i*3+1];
            rootPositions[i*3+2] = treePositions[i*3+2];
          }
        }

        // Tunnel detection
        const tunnelBounds = new THREE.Box3();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          tunnelBounds.expandByPoint(new THREE.Vector3(tunnelPositions[i*3], tunnelPositions[i*3+1], tunnelPositions[i*3+2]));
        }
        const tunnelCenter = tunnelBounds.getCenter(new THREE.Vector3());
        const tunnelSize = tunnelBounds.getSize(new THREE.Vector3());
        let tunnelAxis: "x"|"y"|"z" = "z";
        let tunnelLength = tunnelSize.z;
        if (tunnelSize.x > tunnelSize.y && tunnelSize.x > tunnelSize.z) { tunnelAxis = "x"; tunnelLength = tunnelSize.x; }
        else if (tunnelSize.y > tunnelSize.x && tunnelSize.y > tunnelSize.z) { tunnelAxis = "y"; tunnelLength = tunnelSize.y; }

        // City detection
        const cityBounds = new THREE.Box3();
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          cityBounds.expandByPoint(new THREE.Vector3(cityPositions[i*3], cityPositions[i*3+1], cityPositions[i*3+2]));
        }
        const cityCenter = cityBounds.getCenter(new THREE.Vector3());
        const citySize = cityBounds.getSize(new THREE.Vector3());

        // Build geometry with ALL morph targets
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(galaxyPositions, 3));
        geometry.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute("shift", new THREE.Float32BufferAttribute(shift, 4));
        geometry.setAttribute("aGrid", new THREE.Float32BufferAttribute(gridPositions, 3));
        geometry.setAttribute("aSpheres", new THREE.Float32BufferAttribute(spherePositions, 3));
        geometry.setAttribute("aContinents", new THREE.Float32BufferAttribute(continentPositions, 3));
        geometry.setAttribute("aRain", new THREE.Float32BufferAttribute(rainPositions, 3));
        geometry.setAttribute("aTrunk", new THREE.Float32BufferAttribute(trunkPositions, 3));
        geometry.setAttribute("aBranches", new THREE.Float32BufferAttribute(branchPositions, 3));
        geometry.setAttribute("aTree", new THREE.Float32BufferAttribute(treePositions, 3));
        geometry.setAttribute("aRoots", new THREE.Float32BufferAttribute(rootPositions, 3));
        geometry.setAttribute("aTunnel", new THREE.Float32BufferAttribute(tunnelPositions, 3));
        geometry.setAttribute("aCity", new THREE.Float32BufferAttribute(cityPositions, 3));

        const material = new THREE.PointsMaterial({
          size: 0.07,
          transparent: true,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        });

        material.onBeforeCompile = (shader) => {
          shader.uniforms.time = gu.time;
          shader.uniforms.morphProgress = gu.morphProgress;
          shader.uniforms.morphTarget = gu.morphTarget;
          shader.uniforms.beatLocal = gu.beatLocal;

          shader.vertexShader = `
            uniform float time;
            uniform float morphProgress;
            uniform float morphTarget;
            uniform float beatLocal;
            attribute float sizes;
            attribute vec4 shift;
            attribute vec3 aGrid;
            attribute vec3 aSpheres;
            attribute vec3 aContinents;
            attribute vec3 aRain;
            attribute vec3 aTrunk;
            attribute vec3 aBranches;
            attribute vec3 aTree;
            attribute vec3 aRoots;
            attribute vec3 aTunnel;
            attribute vec3 aCity;
            varying vec3 vColor;
            
            vec3 getTarget(float target) {
              // Smooth selector
              if (target < 0.5) return position;        // 0 = galaxy
              if (target < 1.5) return aGrid;           // 1 = grid
              if (target < 2.5) return aSpheres;        // 2 = spheres
              if (target < 3.5) return aContinents;     // 3 = continents
              if (target < 4.5) return aRain;           // 4 = rain
              if (target < 5.5) return aTrunk;          // 5 = trunk
              if (target < 6.5) return aBranches;       // 6 = branches
              if (target < 7.5) return aTree;           // 7 = tree
              if (target < 8.5) return aTree;           // 8 = treeOrbit (same shape, camera moves)
              if (target < 9.5) return aRoots;          // 9 = roots
              if (target < 10.5) return aTunnel;        // 10 = tunnel
              return aCity;                              // 11 = city
            }
            
            vec3 getColor(float target, vec3 pos) {
              // Galaxy
              if (target < 0.5) {
                float dg = length(abs(pos) / vec3(40., 10., 40.));
                return mix(vec3(0.89, 0.61, 0.), vec3(0.39, 0.2, 1.), clamp(dg, 0., 1.));
              }
              // Grid — cool white/blue
              if (target < 1.5) return vec3(1., 1., 1.) * 0.35;
              // Spheres — white
              if (target < 2.5) return vec3(1., 1., 1.) * 0.35;
              // Continents — white
              if (target < 3.5) return vec3(1., 1., 1.) * 0.35;
              // Rain — white falling
              if (target < 4.5) return vec3(1., 1., 1.) * 0.35;
              // Trunk — pink
              if (target < 5.5) return vec3(0.976, 0.624, 0.788);
              // Branches — pink
              if (target < 6.5) return vec3(0.976, 0.624, 0.788);
              // Tree/orbit — pink to purple by height
              if (target < 8.5) {
                float h = clamp((pos.y + 7.5) / 15., 0., 1.);
                return mix(vec3(0.976, 0.624, 0.788), vec3(0.549, 0.392, 0.863), smoothstep(0.2, 0.6, h));
              }
              // Roots — pink/plum
              if (target < 9.5) return mix(vec3(0.976, 0.624, 0.788), vec3(0.318, 0.165, 0.267), 0.3);
              // Tunnel — plum to gold
              if (target < 10.5) {
                float d = clamp((pos.z + 10.) / 20., 0., 1.);
                return mix(vec3(0.318, 0.165, 0.267), vec3(1., 0.722, 0.11), d);
              }
              // City — gold to pink
              float h = clamp(pos.y / 15., 0., 1.);
              return mix(vec3(1., 0.722, 0.11), vec3(0.976, 0.624, 0.788), smoothstep(0.3, 0.8, h));
            }
            
            ${shader.vertexShader}
          `.replace(
            `gl_PointSize = size;`,
            `gl_PointSize = size * sizes * (1.0 - morphProgress * 0.3);`
          ).replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
              float t = time;
              float moveT = mod(shift.x + shift.z * t, 6.2831853);
              float moveS = mod(shift.y + shift.z * t, 6.2831853);
              vec3 wobble = vec3(cos(moveS)*sin(moveT), cos(moveT), sin(moveS)*sin(moveT)) * shift.w;
              
              // Grid wave displacement
              vec3 gridTarget = aGrid;
              float waveY = sin(aGrid.x * 0.3 + t * 2.0) * cos(aGrid.z * 0.25 + t * 1.5) * 1.5;
              waveY += sin(aGrid.x * 0.15 - t * 1.2) * 0.8;
              gridTarget.y = waveY;
              
              vec3 target = getTarget(morphTarget);
              // Override grid with animated version
              if (morphTarget > 0.5 && morphTarget < 1.5) target = gridTarget;
              
              vec3 morphed = mix(transformed + wobble, target + wobble * 0.15, morphProgress);
              transformed = morphed;
            `
          ).replace(
            `#include <color_vertex>`,
            `#include <color_vertex>
              vec3 targetPos = getTarget(morphTarget);
              if (morphTarget > 0.5 && morphTarget < 1.5) {
                float waveY = sin(aGrid.x * 0.3 + time * 2.0) * cos(aGrid.z * 0.25 + time * 1.5) * 1.5;
                targetPos.y = waveY;
              }
              vec3 galaxyColor = vec3(0.89, 0.61, 0.) ;
              float dg = length(abs(position) / vec3(40., 10., 40.));
              galaxyColor = mix(vec3(0.89, 0.61, 0.), vec3(0.39, 0.2, 1.), clamp(dg, 0., 1.));
              vec3 targetColor = getColor(morphTarget, targetPos);
              vColor = mix(galaxyColor, targetColor, morphProgress);
            `
          );

          shader.fragmentShader = `
            varying vec3 vColor;
            ${shader.fragmentShader}
          `.replace(
            `#include <clipping_planes_fragment>`,
            `#include <clipping_planes_fragment>
              float d = length(gl_PointCoord.xy - 0.5);
            `
          ).replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            `vec4 diffuseColor = vec4( vColor, smoothstep(0.5, 0.1, d) );`
          );
        };

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Camera path helpers
        const treeCenter = new THREE.Vector3(0, treeMin + treeHeight * 0.5, 0);

        // Smooth step
        const ease = (v: number) => v * v * (3 - 2 * v);

        // Current morph state for smooth transitions
        let currentMorphProgress = 0;
        let currentMorphTarget = 0;
        let targetMorphTarget = 0;
        let targetMorphProgress = 0;

        const clock = new THREE.Clock();

        const animate = () => {
          if (disposed) return;
          requestAnimationFrame(animate);

          const t = clock.getElapsedTime() * 0.5;
          gu.time.value = t * Math.PI;

          const { beatIndex, localProgress } = scrollRef.current;

          // Set morph targets based on beat
          targetMorphTarget = beatIndex;
          targetMorphProgress = beatIndex === 0 ? localProgress : 1;

          // Smooth morph transitions
          currentMorphTarget += (targetMorphTarget - currentMorphTarget) * 0.05;
          currentMorphProgress += (targetMorphProgress - currentMorphProgress) * 0.08;

          gu.morphTarget.value = currentMorphTarget;
          gu.morphProgress.value = ease(Math.min(currentMorphProgress, 1));
          gu.beatLocal.value = localProgress;

          // Slow rotation for galaxy/planet
          if (beatIndex <= 0) {
            points.rotation.y = t * 0.05;
            points.rotation.z = 0.2;
          } else {
            // Reduce rotation when morphed
            points.rotation.y += (0 - points.rotation.y) * 0.02;
            points.rotation.z += (0 - points.rotation.z) * 0.02;
          }

          // Camera paths per beat
          updateCamera(beatIndex, localProgress, t, camera, treeCenter, treeMin, treeHeight,
            tunnelCenter, tunnelLength, tunnelAxis, cityCenter, citySize);

          renderer.render(scene, camera);
        };

        animate();

        return () => {
          geometry.dispose();
          material.dispose();
        };
      } catch (err) {
        console.error("Failed to load models:", err);
      }
    };

    init();

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

function updateCamera(
  beat: number, progress: number, time: number,
  camera: THREE.PerspectiveCamera,
  treeCenter: THREE.Vector3, treeMin: number, treeHeight: number,
  tunnelCenter: THREE.Vector3, tunnelLength: number, tunnelAxis: string,
  cityCenter: THREE.Vector3, citySize: THREE.Vector3
) {
  const smooth = progress * progress * (3 - 2 * progress);

  switch (beat) {
    case 0: // Planet — wide view
      camera.position.set(0, 0, 40 - smooth * 5);
      camera.lookAt(0, 0, 0);
      break;

    case 1: // Grid — low horizon
      camera.position.set(0, 1.5, 25 - smooth * 10);
      camera.lookAt(0, 0, -10);
      break;

    case 2: // Spheres — pull back and rise
      camera.position.set(
        Math.sin(smooth * 0.5) * 5,
        5 + smooth * 10,
        20 + smooth * 5
      );
      camera.lookAt(0, 0, 0);
      break;

    case 3: // Continents — overhead drone
      camera.position.set(
        Math.sin(time * 0.1) * 3,
        25 + smooth * 10,
        Math.cos(time * 0.1) * 3
      );
      camera.lookAt(0, 0, 0);
      break;

    case 4: // Rain — swing to ground level
    {
      const downT = Math.min(smooth * 2, 1);
      camera.position.set(0, 25 * (1 - downT) + 2 * downT, 20);
      camera.lookAt(0, -5, -10);
      break;
    }

    case 5: // Trunk — ground level looking up
    {
      camera.position.set(0, treeMin + smooth * treeHeight * 0.3, 15);
      camera.lookAt(0, treeMin + treeHeight * 0.3, 0);
      break;
    }

    case 6: // Branches — orbit the trunk
    {
      const angle = smooth * Math.PI;
      camera.position.set(
        Math.sin(angle) * 18,
        treeMin + treeHeight * 0.4,
        Math.cos(angle) * 18
      );
      camera.lookAt(0, treeMin + treeHeight * 0.4, 0);
      break;
    }

    case 7: // Full tree — rise alongside
    {
      camera.position.set(
        Math.sin(time * 0.05) * 3,
        treeMin + smooth * treeHeight,
        20
      );
      camera.lookAt(0, treeMin + treeHeight * 0.5, 0);
      break;
    }

    case 8: // Tree orbit — 360° smooth walk
    {
      const angle = smooth * Math.PI * 2;
      const radius = 22;
      camera.position.set(
        Math.sin(angle) * radius,
        5,
        Math.cos(angle) * radius
      );
      camera.lookAt(0, treeMin + treeHeight * 0.35, 0);
      break;
    }

    case 9: // Roots — drop below, then tilt up to trunk base
    {
      const dropPhase = Math.min(smooth * 2, 1);
      const tiltPhase = Math.max((smooth - 0.5) * 2, 0);
      camera.position.set(0, treeMin - 18 * dropPhase + tiltPhase * 10, 8);
      camera.lookAt(0, treeMin - 5 + tiltPhase * 10, 0);
      break;
    }

    case 10: // Tunnel — forward push
    {
      const halfLen = tunnelLength * 0.45;
      const z = tunnelAxis === "z" ? tunnelCenter.z - halfLen + smooth * tunnelLength * 0.9 : tunnelCenter.z;
      const x = tunnelAxis === "x" ? tunnelCenter.x - halfLen + smooth * tunnelLength * 0.9 : tunnelCenter.x;
      const y = tunnelAxis === "y" ? tunnelCenter.y - halfLen + smooth * tunnelLength * 0.9 : tunnelCenter.y;
      camera.position.set(x, y, z);

      const ahead = Math.min(smooth + 0.05, 1);
      const lz = tunnelAxis === "z" ? tunnelCenter.z - halfLen + ahead * tunnelLength * 0.9 : tunnelCenter.z;
      const lx = tunnelAxis === "x" ? tunnelCenter.x - halfLen + ahead * tunnelLength * 0.9 : tunnelCenter.x;
      const ly = tunnelAxis === "y" ? tunnelCenter.y - halfLen + ahead * tunnelLength * 0.9 : tunnelCenter.y;
      camera.lookAt(lx, ly, lz);
      break;
    }

    case 11: // City — burst out then drift in
    {
      if (smooth < 0.3) {
        // Pull back from tunnel exit
        const t = smooth / 0.3;
        camera.position.set(
          cityCenter.x,
          cityCenter.y + citySize.y * 0.8,
          cityCenter.z + 25 - t * 7
        );
        camera.lookAt(cityCenter.x, cityCenter.y, cityCenter.z);
      } else {
        // Drift into city
        const t = (smooth - 0.3) / 0.7;
        camera.position.set(
          cityCenter.x + Math.sin(t * 0.5) * 3,
          cityCenter.y + citySize.y * 0.3 * (1 - t),
          cityCenter.z + 18 - t * 16
        );
        camera.lookAt(cityCenter.x, cityCenter.y, cityCenter.z);
      }
      break;
    }
  }
}

export default ParticleScene;
```

---

## File 5: `src/components/thinktum/ChromeOverlay.tsx`

Fixed UI overlay with corner brackets, thinktum branding, progress bar, beat counter, and headline/support text.

```tsx
import { type ScrollState } from "./useScrollProgress";
import { beats } from "./beatConfig";

interface ChromeOverlayProps {
  scrollState: ScrollState;
  onPrev: () => void;
  onNext: () => void;
}

const ChromeOverlay = ({ scrollState, onPrev, onNext }: ChromeOverlayProps) => {
  const { beatIndex, localProgress, counter } = scrollState;
  const beat = beats[beatIndex];

  const canPrev = beatIndex > 0;
  const canNext = beatIndex < beats.length - 1;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Corner brackets */}
      <Bracket position="top-left" />
      <Bracket position="top-right" />
      <Bracket position="bottom-left" />
      <Bracket position="bottom-right" />

      {/* Top left — thinktum */}
      <div
        className="absolute"
        style={{
          top: 40,
          left: 40,
          fontSize: 12,
          fontWeight: 300,
          color: "rgba(255,255,255,0.45)",
          letterSpacing: "0.15em",
        }}
      >
        thinktum
      </div>

      {/* Top right — counter + arrows + progress */}
      <div className="absolute flex items-start gap-4" style={{ top: 40, right: 40 }}>
        {/* Arrows */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <button
            onClick={onPrev}
            className="bg-transparent border-none outline-none"
            style={{
              fontSize: 11,
              fontWeight: 400,
              color: canPrev ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)",
              cursor: canPrev ? "pointer" : "default",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            ▲
          </button>
          <button
            onClick={onNext}
            className="bg-transparent border-none outline-none"
            style={{
              fontSize: 11,
              fontWeight: 400,
              color: canNext ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.18)",
              cursor: canNext ? "pointer" : "default",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            ▼
          </button>
        </div>

        {/* Counter */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {counter}
        </span>

        {/* Progress bar */}
        <div
          style={{
            width: 2,
            height: 60,
            background: "rgba(255,255,255,0.12)",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 2,
              height: `${scrollState.globalProgress * 100}%`,
              background: "rgba(255,255,255,0.55)",
              transition: "height 0.1s ease-out",
            }}
          />
        </div>
      </div>

      {/* Bottom left — beat copy */}
      <div className="absolute" style={{ bottom: 48, left: 40, maxWidth: 520 }}>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 4vw, 4rem)",
            fontWeight: 600,
            color: "#ffffff",
            lineHeight: 1.1,
            margin: 0,
            opacity: beat?.headline ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          {beat?.headline}
        </h1>
        <p
          style={{
            fontSize: "clamp(0.75rem, 1vw, 0.9rem)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.45)",
            marginTop: 12,
            lineHeight: 1.6,
            opacity: beat?.support ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          {beat?.support}
        </p>
      </div>

      {/* Bottom right — Chicago */}
      <div
        className="absolute"
        style={{
          bottom: 48,
          right: 40,
          fontSize: 11,
          fontWeight: 400,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Chicago
      </div>
    </div>
  );
};

/** Corner bracket — 22x22px decorative element */
const Bracket = ({ position }: { position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) => {
  const offset = 28;
  const size = 22;
  const color = "rgba(255,255,255,0.22)";

  const posStyle: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    ...(position.includes("top") ? { top: offset } : { bottom: offset }),
    ...(position.includes("left") ? { left: offset } : { right: offset }),
  };

  const borders: React.CSSProperties = {
    borderColor: color,
    borderStyle: "solid",
    borderWidth: 0,
    ...(position.includes("top") ? { borderTopWidth: 1 } : { borderBottomWidth: 1 }),
    ...(position.includes("left") ? { borderLeftWidth: 1 } : { borderRightWidth: 1 }),
  };

  return <div style={{ ...posStyle, ...borders }} />;
};

export default ChromeOverlay;
```

---

## File 6: `src/components/thinktum/BeatCard.tsx`

Glass-morphism cards with bracket corners, used for LIZ suite cards (Beat 8) and industry cards (Beat 10).

```tsx
import type { BeatCard as BeatCardType } from "./beatConfig";

interface BeatCardProps {
  card: BeatCardType;
  visible: boolean;
}

const BeatCard = ({ card, visible }: BeatCardProps) => {
  return (
    <div
      className="pointer-events-auto"
      style={{
        position: "absolute",
        ...(card.side === "left" ? { left: 60 } : { right: 60 }),
        top: "50%",
        transform: "translateY(-50%)",
        maxWidth: 320,
        padding: "24px 28px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 2,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: visible ? "opacity 0.6s ease" : "opacity 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Bracket corners */}
      <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 500,
          color: "#ffffff",
          margin: 0,
          marginBottom: 8,
        }}
      >
        {card.title}
      </h3>
      <p
        style={{
          fontSize: "0.82rem",
          fontWeight: 300,
          color: "rgba(255,255,255,0.55)",
          lineHeight: 1.6,
          margin: 0,
          whiteSpace: "pre-line",
        }}
      >
        {card.body}
      </p>
      <button
        style={{
          marginTop: 16,
          fontSize: "0.82rem",
          fontWeight: 400,
          color: "#F99FC9",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        {card.cta}
      </button>
    </div>
  );
};

const Corner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => {
  const s = 6;
  const c = "rgba(255,255,255,0.35)";
  const style: React.CSSProperties = {
    position: "absolute",
    width: s,
    height: s,
    borderColor: c,
    borderStyle: "solid",
    borderWidth: 0,
    ...(pos.includes("t") ? { top: -1, borderTopWidth: 1 } : { bottom: -1, borderBottomWidth: 1 }),
    ...(pos.includes("l") ? { left: -1, borderLeftWidth: 1 } : { right: -1, borderRightWidth: 1 }),
  };
  return <div style={style} />;
};

export default BeatCard;
```

---

## File 7: `src/components/thinktum/BracketCursor.tsx`

Custom `[ ]` cursor that follows the mouse with lerp smoothing.

```tsx
import { useEffect, useRef } from "react";

const BracketCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      const lerp = 0.12;
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * lerp;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${currentPos.current.x - 12}px, ${currentPos.current.y - 12}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{ willChange: "transform" }}
    >
      <span
        style={{
          display: "block",
          width: 24,
          height: 24,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 20,
          fontWeight: 300,
          color: "rgba(255,255,255,0.65)",
          lineHeight: "24px",
          textAlign: "center",
          letterSpacing: "0.05em",
        }}
      >
        [ ]
      </span>
    </div>
  );
};

export default BracketCursor;
```

---

## File 8: `src/components/thinktum/ScrollExperience.tsx`

Root component that wires everything together — scroll container, particle scene, cards overlay, city finale, and chrome.

```tsx
import { useRef, useCallback } from "react";
import { beats } from "./beatConfig";
import { useScrollProgress } from "./useScrollProgress";
import ChromeOverlay from "./ChromeOverlay";
import BracketCursor from "./BracketCursor";
import BeatCard from "./BeatCard";
import { lizCards, tunnelCards } from "./beatConfig";
import ParticleScene from "./ParticleScene";

const totalWeight = beats.reduce((s, b) => s + b.scrollWeight, 0);

const ScrollExperience = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollState = useScrollProgress(scrollRef);

  const scrollToBeat = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      const maxScroll = el.scrollHeight - el.clientHeight;
      // Find cumulative weight up to beat index
      let acc = 0;
      for (let i = 0; i < index && i < beats.length; i++) {
        acc += beats[i].scrollWeight / totalWeight;
      }
      el.scrollTo({ top: acc * maxScroll, behavior: "smooth" });
    },
    []
  );

  const onPrev = useCallback(() => {
    if (scrollState.beatIndex > 0) scrollToBeat(scrollState.beatIndex - 1);
  }, [scrollState.beatIndex, scrollToBeat]);

  const onNext = useCallback(() => {
    if (scrollState.beatIndex < beats.length - 1) scrollToBeat(scrollState.beatIndex + 1);
  }, [scrollState.beatIndex, scrollToBeat]);

  // Determine which cards to show
  const activeCards = scrollState.beatIndex === 8
    ? lizCards
    : scrollState.beatIndex === 10
      ? tunnelCards
      : [];

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: "#080810", cursor: "none" }}
    >
      {/* Fixed Three.js canvas */}
      <div className="fixed inset-0 z-0">
        <ParticleScene scrollState={scrollState} />
      </div>

      {/* Scrollable content — invisible spacer */}
      <div
        ref={scrollRef}
        className="absolute inset-0 z-10 overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div style={{ height: `${totalWeight * 100}vh` }} />
      </div>

      {/* Cards overlay */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        {activeCards.map((card, i) => {
          const visible =
            scrollState.localProgress >= card.appearAt &&
            scrollState.localProgress <= card.disappearAt;
          return <BeatCard key={`${card.title}-${i}`} card={card} visible={visible} />;
        })}
      </div>

      {/* City finale overlay */}
      {scrollState.beatIndex === 11 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <h1
              style={{
                fontSize: "clamp(2.8rem, 5vw, 5rem)",
                fontWeight: 600,
                color: scrollState.localProgress > 0.5 ? "#F99FC9" : "#ffffff",
                transition: "color 1s ease",
                margin: 0,
              }}
            >
              {scrollState.localProgress > 0.5
                ? "That's why we built LIZ."
                : "Insurance built for the age of AI."}
            </h1>
            {scrollState.localProgress > 0.6 && (
              <button
                className="pointer-events-auto"
                style={{
                  marginTop: 32,
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  color: "#ffffff",
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.35)",
                  padding: "12px 28px",
                  borderRadius: 24,
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: "border-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
              >
                Request a demo →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chrome */}
      <ChromeOverlay scrollState={scrollState} onPrev={onPrev} onNext={onNext} />
      <BracketCursor />
    </div>
  );
};

export default ScrollExperience;
```

---

## Architecture Summary

```
ScrollExperience (root)
├── ParticleScene (Three.js canvas — fixed, z-0)
│   └── 80k particles with shader-based morphing between 11 formations
│       Galaxy → Grid → Spheres → Continents → Rain → Trunk → Branches → Tree → TreeOrbit → Roots → Tunnel → City
├── Scroll container (invisible spacer, z-10)
│   └── useScrollProgress maps scrollTop → { beatIndex, localProgress, counter }
├── BeatCard overlay (z-40, pointer-events-none)
│   ├── Beat 8: 3 LIZ cards (flow, assess, data) at 120° intervals
│   └── Beat 10: 6 industry cards alternating left/right
├── City finale overlay (z-40, beat 11)
│   └── "Insurance built for the age of AI" → "That's why we built LIZ" → CTA
├── ChromeOverlay (z-50)
│   ├── Corner brackets (22×22px)
│   ├── thinktum branding (top-left)
│   ├── Counter + progress bar (top-right)
│   ├── Beat headline + support (bottom-left)
│   └── Chicago label (bottom-right)
└── BracketCursor (z-9999, mix-blend-difference)
```

## Key Design Tokens
- Background: `#080810`
- Structure particles: `#F99FC9` (pink)
- City gold: `#FFB81C`
- Card bg: `rgba(255,255,255,0.04)` with `backdrop-filter: blur(8px)`
- Font: Space Grotesk (300/400/500/600)
