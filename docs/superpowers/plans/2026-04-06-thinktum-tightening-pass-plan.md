# Thinktum Tightening Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the early and tree-focused particle formations in the React Thinktum scroll experience so the planet, spheres, middle beats, and staged tree reveal read clearly without changing the approved narrative copy or beat order.

**Architecture:** Keep the existing React/Vite/Three.js experience intact and concentrate changes inside the particle formation pipeline in `ParticleScene.tsx`. Replace loose procedural targets with tighter authored distributions, compute more intentional tree masks from the sampled FBX positions, and preserve the same beat-to-copy mapping and UI overlay behavior.

**Tech Stack:** React 18, TypeScript, Vite 5, Three.js 0.136, FBXLoader, MeshSurfaceSampler

---

## File Structure

- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
  - Tighten procedural formation generation for planet, spheres, and middle beats
  - Rework tree segmentation logic for trunk, branches, and roots
  - Preserve shader, beat wiring, and camera update entrypoints
- Optional modify: `tree-fbx-demo/new-scroll-exp/src/lib/meshSurfaceSampler.ts`
  - Only if a small helper is needed for tighter sampled-point normalization
- Verify: `tree-fbx-demo/new-scroll-exp/package.json`
  - Use existing build script for verification

### Task 1: Tighten planet and sphere formations

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Replace the current loose galaxy-shell opening with a tighter planet distribution**

Update the opening formation generation so the “planet” beat has a denser spherical body and fewer strays. Replace the current two-part galaxy initialization with a tighter shell/core balance like this:

```ts
    const galaxyPositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const shellBias = i / PARTICLE_COUNT;
      const radius =
        shellBias < 0.72
          ? 8.6 + Math.random() * 1.8
          : Math.pow(Math.random(), 1.8) * 7.2;
      const v = new THREE.Vector3().randomDirection().multiplyScalar(radius);
      const flatten = 0.92 + Math.random() * 0.12;
      galaxyPositions[i * 3] = v.x;
      galaxyPositions[i * 3 + 1] = v.y * flatten;
      galaxyPositions[i * 3 + 2] = v.z;
      sizes.push(Math.random() * 1.1 + 0.55);
      pushShift();
    }
```

- [ ] **Step 2: Replace the current sphere cluster generation with six cleaner sphere volumes**

Update the spheres beat so it reads as six actual spheres rather than random clumps:

```ts
    const spherePositions = new Float32Array(PARTICLE_COUNT * 3);
    const sphereCenters = [
      [-14, 8, -6],
      [0, 10, -10],
      [14, 7, -5],
      [-12, -6, 8],
      [2, -8, 11],
      [16, -4, 6],
    ] as const;
    const sphereRadius = 3.4;
    const perSphere = Math.floor(PARTICLE_COUNT / sphereCenters.length);

    for (let s = 0; s < sphereCenters.length; s += 1) {
      const [cx, cy, cz] = sphereCenters[s];
      for (let j = 0; j < perSphere; j += 1) {
        const idx = s * perSphere + j;
        if (idx >= PARTICLE_COUNT) break;

        const dir = new THREE.Vector3().randomDirection();
        const radius = sphereRadius * Math.cbrt(Math.random());
        spherePositions[idx * 3] = cx + dir.x * radius;
        spherePositions[idx * 3 + 1] = cy + dir.y * radius;
        spherePositions[idx * 3 + 2] = cz + dir.z * radius;
      }
    }

    for (let i = perSphere * sphereCenters.length; i < PARTICLE_COUNT; i += 1) {
      const [cx, cy, cz] = sphereCenters[i % sphereCenters.length];
      const dir = new THREE.Vector3().randomDirection();
      const radius = sphereRadius * Math.cbrt(Math.random());
      spherePositions[i * 3] = cx + dir.x * radius;
      spherePositions[i * 3 + 1] = cy + dir.y * radius;
      spherePositions[i * 3 + 2] = cz + dir.z * radius;
    }
```

- [ ] **Step 3: Run the production build to verify the tighter opening formations compile**

Run: `npm run build`

Expected: Vite build completes successfully with no TypeScript errors.

### Task 2: Make the middle procedural beats more intentional

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Replace the current continent blobs with cleaner continent-like plate shapes**

Use more disciplined elliptical regions and thinner vertical spread so the beat feels deliberate:

```ts
    const continentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const continentShapes = [
      { cx: -18, cz: -4, rx: 9, rz: 5, tilt: 0.22 },
      { cx: -2, cz: -7, rx: 6, rz: 8, tilt: -0.18 },
      { cx: 16, cz: 0, rx: 10, rz: 6, tilt: 0.12 },
      { cx: 19, cz: 10, rx: 4, rz: 3, tilt: -0.1 },
      { cx: -6, cz: 10, rx: 3, rz: 2, tilt: 0.08 },
    ];
```

For each particle, sample within the ellipse, rotate by `tilt`, and keep `y` near `0` with only a very small random offset:

```ts
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random());
        const localX = Math.cos(angle) * radius * shape.rx;
        const localZ = Math.sin(angle) * radius * shape.rz;
        const rotX = localX * Math.cos(shape.tilt) - localZ * Math.sin(shape.tilt);
        const rotZ = localX * Math.sin(shape.tilt) + localZ * Math.cos(shape.tilt);
        continentPositions[idx * 3] = shape.cx + rotX;
        continentPositions[idx * 3 + 1] = (Math.random() - 0.5) * 0.4;
        continentPositions[idx * 3 + 2] = shape.cz + rotZ;
```

- [ ] **Step 2: Replace the current rain beat with a more readable collapsing-column field**

Make the “gap became impossible” beat feel like a real structural collapse rather than random scatter:

```ts
    const rainPositions = new Float32Array(PARTICLE_COUNT * 3);
    const laneCount = 18;
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const lane = i % laneCount;
      const laneX = (lane / (laneCount - 1) - 0.5) * 42;
      const laneZ = (Math.floor(i / laneCount) % laneCount) / (laneCount - 1) * 24 - 12;
      rainPositions[i * 3] = laneX + (Math.random() - 0.5) * 0.9;
      rainPositions[i * 3 + 1] = -14 + Math.random() * 8;
      rainPositions[i * 3 + 2] = laneZ + (Math.random() - 0.5) * 0.9;
    }
```

- [ ] **Step 3: Keep the existing build green after the middle-shape tightening**

Run: `npm run build`

Expected: Build succeeds, and no new shader or typing issues appear.

### Task 3: Rebuild tree staging for trunk, branches, and full tree with roots

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Add normalized tree metrics so each sampled point has height and radial context**

Inside the tree processing block, compute a stable per-point metric set before assigning trunk/branch/root targets:

```ts
        const treeMetrics = new Array(PARTICLE_COUNT);
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const x = treePositions[i * 3];
          const y = treePositions[i * 3 + 1];
          const z = treePositions[i * 3 + 2];
          const relH = (y - treeMin) / Math.max(treeHeight, 0.0001);
          const radial = Math.sqrt(x * x + z * z);
          treeMetrics[i] = { x, y, z, relH, radial };
        }
```

- [ ] **Step 2: Replace the current coarse trunk/branch/root masks with tighter staged targets**

Use the metrics to keep the trunk compact, reveal branches more deliberately, and control roots:

```ts
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const { x, y, z, relH, radial } = treeMetrics[i];
          const compactX = x * 0.22;
          const compactZ = z * 0.22;
          const baseY = treeMin + Math.min(relH, 0.18) * treeHeight * 0.55;

          const isTrunk = relH < 0.42 && radial < 2.9 + relH * 5.2;
          const isBranch = relH < 0.82 && radial < 8.8 + relH * 8.5;
          const isRoot = relH < 0.22 && radial < 7.5;

          if (isTrunk) {
            trunkPositions[i * 3] = x * 0.92;
            trunkPositions[i * 3 + 1] = y;
            trunkPositions[i * 3 + 2] = z * 0.92;
          } else {
            trunkPositions[i * 3] = compactX;
            trunkPositions[i * 3 + 1] = baseY;
            trunkPositions[i * 3 + 2] = compactZ;
          }

          if (isBranch) {
            branchPositions[i * 3] = x * 0.96;
            branchPositions[i * 3 + 1] = y;
            branchPositions[i * 3 + 2] = z * 0.96;
          } else {
            branchPositions[i * 3] = x * 0.42;
            branchPositions[i * 3 + 1] = treeMin + treeHeight * (0.22 + relH * 0.33);
            branchPositions[i * 3 + 2] = z * 0.42;
          }

          if (isRoot) {
            rootPositions[i * 3] = x * 1.08;
            rootPositions[i * 3 + 1] = treeMin - (treeMin + treeHeight * 0.18 - y) * 0.95;
            rootPositions[i * 3 + 2] = z * 1.08;
          } else {
            rootPositions[i * 3] = x * 0.95;
            rootPositions[i * 3 + 1] = y;
            rootPositions[i * 3 + 2] = z * 0.95;
          }
        }
```

- [ ] **Step 3: Tighten the fully assembled tree target slightly so it feels less blown apart**

After normalizing the sampled tree positions, apply a small compaction pass before using them as `aTree`:

```ts
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const relH = (treePositions[i * 3 + 1] - treeMin) / Math.max(treeHeight, 0.0001);
          const tighten = relH < 0.7 ? 0.92 : 0.96;
          treePositions[i * 3] *= tighten;
          treePositions[i * 3 + 2] *= tighten;
        }
```

- [ ] **Step 4: Rebuild and verify the staged tree pass compiles cleanly**

Run: `npm run build`

Expected: Build succeeds with the same Vite bundle workflow as before.

### Task 4: Final verification and run check

**Files:**
- Verify: `tree-fbx-demo/new-scroll-exp`

- [ ] **Step 1: Run the final production build**

Run: `npm run build`

Expected: Successful build output in `dist/`

- [ ] **Step 2: Start or reuse the local dev server for manual visual review**

Run: `npm run dev -- --host 127.0.0.1 --port 4173`

Expected: Vite serves the app at `http://127.0.0.1:4173/`

- [ ] **Step 3: Manual visual checklist**

Confirm in the browser:
- planet is tighter and more spherical
- spheres are clearly individual spheres
- middle beats read more intentionally
- tree reveal reads as trunk, then branches, then full tree with roots
- full tree feels less spread out than before
