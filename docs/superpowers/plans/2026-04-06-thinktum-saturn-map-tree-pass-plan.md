# Thinktum Saturn, Map, and Tree Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Saturn-like opening, make the later spheres read as smaller versions of that same sphere language, redesign the geography beat as broken map-like fragments, and retune the tree stages around the correct autumn tree asset.

**Architecture:** Keep the current React/Vite/Three.js app intact and concentrate changes in the formation-generation logic inside `ParticleScene.tsx`. Use procedural particle targets for Saturn, the small spheres, and the map fragments, then loosen and clean the autumn-tree masks so each tree state reads intentionally without distorting the source silhouette.

**Tech Stack:** React 18, TypeScript, Vite 5, Three.js 0.136, FBXLoader, MeshSurfaceSampler

---

## File Structure

- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
  - Replace the opening planet with a sphere-plus-ring target
  - Rebuild the later sphere beat from the same spherical logic
  - Replace the geography beat with map-like fragment shapes
  - Retune the tree stage masks against the autumn tree
- Verify: `tree-fbx-demo/new-scroll-exp/package.json`
  - Use the existing build script for verification

### Task 1: Restore the Saturn-like opening and matching smaller spheres

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Replace the current beat 0 body with a sphere-plus-ring distribution**

Update the `galaxyPositions` generation so the first scene has a dense spherical body plus a separate ring population:

```ts
    const galaxyPositions = new Float32Array(PARTICLE_COUNT * 3);
    const saturnBodyCount = Math.floor(PARTICLE_COUNT * 0.62);
    const saturnRingCount = PARTICLE_COUNT - saturnBodyCount;

    for (let i = 0; i < saturnBodyCount; i += 1) {
      const dir = new THREE.Vector3().randomDirection();
      const radius = Math.pow(Math.random(), 0.82) * 8.2;
      galaxyPositions[i * 3] = dir.x * radius;
      galaxyPositions[i * 3 + 1] = dir.y * radius * 0.94;
      galaxyPositions[i * 3 + 2] = dir.z * radius;
      sizes.push(Math.random() * 1.0 + 0.65);
      pushShift();
    }

    for (let i = 0; i < saturnRingCount; i += 1) {
      const idx = saturnBodyCount + i;
      const angle = Math.random() * Math.PI * 2;
      const ringRadius = 11.5 + (Math.random() - 0.5) * 3.8;
      galaxyPositions[idx * 3] = Math.cos(angle) * ringRadius;
      galaxyPositions[idx * 3 + 1] = (Math.random() - 0.5) * 0.55;
      galaxyPositions[idx * 3 + 2] = Math.sin(angle) * ringRadius * 0.62;
      sizes.push(Math.random() * 0.7 + 0.45);
      pushShift();
    }
```

- [ ] **Step 2: Rebuild the later sphere beat so each sphere uses the same body logic as the opening**

Update `spherePositions` so each sphere reads like a miniature version of the beat 0 body, without rings:

```ts
    const spherePositions = new Float32Array(PARTICLE_COUNT * 3);
    const sphereCenters = [
      [-13, 8, -6],
      [0, 10, -9],
      [13, 7, -5],
      [-11, -5, 7],
      [1, -7, 10],
      [14, -4, 5],
    ] as const;
    const sphereRadius = 3.1;
    const perSphere = Math.floor(PARTICLE_COUNT / sphereCenters.length);

    for (let s = 0; s < sphereCenters.length; s += 1) {
      const [cx, cy, cz] = sphereCenters[s];
      for (let j = 0; j < perSphere; j += 1) {
        const idx = s * perSphere + j;
        if (idx >= PARTICLE_COUNT) break;
        const dir = new THREE.Vector3().randomDirection();
        const radius = Math.pow(Math.random(), 0.82) * sphereRadius;
        spherePositions[idx * 3] = cx + dir.x * radius;
        spherePositions[idx * 3 + 1] = cy + dir.y * radius * 0.95;
        spherePositions[idx * 3 + 2] = cz + dir.z * radius;
      }
    }

    for (let i = perSphere * sphereCenters.length; i < PARTICLE_COUNT; i += 1) {
      const [cx, cy, cz] = sphereCenters[i % sphereCenters.length];
      const dir = new THREE.Vector3().randomDirection();
      const radius = Math.pow(Math.random(), 0.82) * sphereRadius;
      spherePositions[i * 3] = cx + dir.x * radius;
      spherePositions[i * 3 + 1] = cy + dir.y * radius * 0.95;
      spherePositions[i * 3 + 2] = cz + dir.z * radius;
    }
```

- [ ] **Step 3: Verify the opening and sphere changes compile**

Run: `npm run build`

Expected: Build completes successfully.

### Task 2: Replace the flat geography beat with map-like fragments

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Replace the current continent generation with irregular fragment anchors**

Use a fragment configuration that creates separated top-down regions:

```ts
    const continentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const mapFragments = [
      { cx: -18, cz: -6, baseR: 7.5, stretchX: 1.2, stretchZ: 0.72, wobble: 0.28, rotation: 0.24 },
      { cx: -3, cz: -8, baseR: 6.2, stretchX: 0.9, stretchZ: 1.15, wobble: 0.34, rotation: -0.18 },
      { cx: 14, cz: -2, baseR: 8.1, stretchX: 1.28, stretchZ: 0.8, wobble: 0.26, rotation: 0.1 },
      { cx: 19, cz: 9, baseR: 3.7, stretchX: 1.05, stretchZ: 0.82, wobble: 0.22, rotation: -0.12 },
      { cx: -7, cz: 10, baseR: 2.9, stretchX: 0.92, stretchZ: 0.86, wobble: 0.3, rotation: 0.14 },
    ];
```

- [ ] **Step 2: Sample each fragment with angular wobble so it reads less like an ellipse and more like a broken land region**

Replace the current continent point assignment loop with:

```ts
        const angle = Math.random() * Math.PI * 2;
        const unit = Math.sqrt(Math.random());
        const edge =
          1 +
          Math.sin(angle * 2.0 + shape.rotation * 9.0) * shape.wobble * 0.45 +
          Math.sin(angle * 3.0 - shape.rotation * 5.0) * shape.wobble * 0.28 +
          Math.cos(angle * 5.0) * shape.wobble * 0.18;
        const radius = shape.baseR * edge * unit;

        const localX = Math.cos(angle) * radius * shape.stretchX;
        const localZ = Math.sin(angle) * radius * shape.stretchZ;
        const rotX = localX * Math.cos(shape.rotation) - localZ * Math.sin(shape.rotation);
        const rotZ = localX * Math.sin(shape.rotation) + localZ * Math.cos(shape.rotation);

        continentPositions[idx * 3] = shape.cx + rotX;
        continentPositions[idx * 3 + 1] = (Math.random() - 0.5) * 0.22;
        continentPositions[idx * 3 + 2] = shape.cz + rotZ;
```

- [ ] **Step 3: Rebuild and confirm the geography beat changes compile**

Run: `npm run build`

Expected: Build succeeds with no TypeScript or bundling errors.

### Task 3: Retune the autumn tree stages

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Loosen the full-tree compaction so the autumn canopy keeps its graceful silhouette**

Replace the current post-normalization tree tightening with a gentler compaction:

```ts
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const relH =
            (treePositions[i * 3 + 1] - treeMin) / Math.max(treeHeight, 0.0001);
          const tighten = relH < 0.35 ? 0.96 : relH < 0.72 ? 0.985 : 1.0;
          treePositions[i * 3] *= tighten;
          treePositions[i * 3 + 2] *= tighten;
        }
```

- [ ] **Step 2: Relax the trunk and branch staging so it uses the autumn tree more naturally**

Replace the current mask thresholds with a less aggressive but still clearly staged model. The goal is to preserve the autumn silhouette while keeping the branch and roots beats visibly distinct:

```ts
          const trunkMaxHeight = 0.5;
          const trunkBaseRadius = 2.6;
          const trunkHeightRadiusGain = 4.4;
          const branchMaxHeight = 0.84;
          const branchBaseRadius = 8.6;
          const branchHeightRadiusGain = 5.2;
          const rootMaxHeight = 0.15;
          const rootBaseRadius = 5.8;
          const rootHeightRadiusGain = 2.1;

          const isTrunk =
            relH < trunkMaxHeight &&
            radial < trunkBaseRadius + relH * trunkHeightRadiusGain;
          const isBranch =
            relH < branchMaxHeight &&
            radial < branchBaseRadius + relH * branchHeightRadiusGain;
          const isRoot =
            relH < rootMaxHeight &&
            radial < rootBaseRadius + relH * rootHeightRadiusGain;

          if (isTrunk) {
            trunkPositions[i * 3] = x * 0.96;
            trunkPositions[i * 3 + 1] = y;
            trunkPositions[i * 3 + 2] = z * 0.96;
          } else {
            trunkPositions[i * 3] = x * 0.18;
            trunkPositions[i * 3 + 1] = treeMin + Math.min(relH, 0.22) * treeHeight * 0.62;
            trunkPositions[i * 3 + 2] = z * 0.18;
          }

          if (isBranch) {
            branchPositions[i * 3] = x * 0.99;
            branchPositions[i * 3 + 1] = y;
            branchPositions[i * 3 + 2] = z * 0.99;
          } else {
            branchPositions[i * 3] = x * 0.58;
            branchPositions[i * 3 + 1] = treeMin + treeHeight * (0.28 + relH * 0.38);
            branchPositions[i * 3 + 2] = z * 0.58;
          }

          if (isRoot) {
            rootPositions[i * 3] = x * 1.04;
            rootPositions[i * 3 + 1] = treeMin - (treeMin + treeHeight * 0.14 - y) * 0.82;
            rootPositions[i * 3 + 2] = z * 1.04;
          } else {
            rootPositions[i * 3] = x * 0.24;
            rootPositions[i * 3 + 1] = treeMin + Math.min(relH, 0.18) * treeHeight * 0.12;
            rootPositions[i * 3 + 2] = z * 0.24;
          }
```

This updated root fallback is intentional: it collapses non-root particles inward so beat 9 reads as a roots-focused composition rather than the full tree silhouette.

- [ ] **Step 3: Keep the tree stage build green**

Run: `npm run build`

Expected: Build succeeds and uses the autumn tree from `public/models/tree.fbx`.

### Task 4: Final verification and local run check

**Files:**
- Verify: `tree-fbx-demo/new-scroll-exp`

- [ ] **Step 1: Run the final production build**

Run: `npm run build`

Expected: Successful Vite output in `dist/`

- [ ] **Step 2: Use the running local app for manual review**

Open or refresh: `http://127.0.0.1:4173/`

Check:
- beat 0 reads as Saturn-like again
- the later spheres feel like smaller versions of the beat 0 body
- the geography beat looks like broken map fragments from above
- the autumn tree looks more graceful in trunk, branches, and full-tree states
