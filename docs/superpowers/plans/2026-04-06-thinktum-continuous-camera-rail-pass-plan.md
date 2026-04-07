# Thinktum Continuous Camera Rail Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace chapter-by-chapter camera resets with a few long continuous camera rails so the experience feels like one uninterrupted cinematic journey.

**Architecture:** Keep the current expanded chapter system, particle formations, and overlay behavior, but move camera ownership into a reusable rail model. Chapters will choose formation, text visibility, and a segment of a shared rail instead of defining isolated camera moves.

**Tech Stack:** React 18, TypeScript, Vite 5, Three.js 0.136

---

## File Structure

- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/beatConfig.ts`
  - Add rail metadata and segment progress ranges to chapters
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
  - Replace chapter-specific camera switch logic with continuous rail sampling
- Optional modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ScrollExperience.tsx`
  - Only if chapter/card mapping needs minor alignment after rail metadata changes
- Verify: `tree-fbx-demo/new-scroll-exp/package.json`

### Task 1: Add rail metadata to chapter definitions

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/beatConfig.ts`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Expand `BeatConfig` with rail metadata**

Add rail ownership and normalized segment bounds:

```ts
  rail: "world" | "tree" | "network";
  railStart: number;
  railEnd: number;
```

- [ ] **Step 2: Assign every chapter to one of the three rails**

Map chapters like this:
- `planetArrival` through `rainArrival` -> `world`
- `trunkRise` through `rootsDrop` -> `tree`
- `tunnelEntry` through `cityArrival` -> `network`

Set `railStart` / `railEnd` so adjacent chapters occupy continuous ranges on the same rail.

- [ ] **Step 3: Keep existing counters, card chapters, and text modes intact**

Do not change the approved copy or current chapter ids unless absolutely necessary.

- [ ] **Step 4: Run the build**

Run: `npm run build`

Expected: Build succeeds.

### Task 2: Replace chapter-owned camera moves with rail sampling

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Add reusable rail helpers**

Add helpers for:
- linear interpolation between `THREE.Vector3` control points
- eased segment progress
- sampling camera position and look target from a rail definition

- [ ] **Step 2: Define the three continuous rails**

Create control point arrays for:
- `world` rail
- `tree` rail
- `network` rail

Each rail should include enough points to express the intended motions:
- world: approach, descend, glide, rise, rotate, collapse
- tree: rise, orbit, fill, descend
- network: align, enter, travel, burst, drift

- [ ] **Step 3: Replace `updateCamera` switch logic with rail-driven sampling**

Instead of switching by chapter name, compute:
- current chapter
- active rail
- normalized rail progress from `railStart`, `railEnd`, and `localProgress`

Then sample camera position/look target from that rail.

- [ ] **Step 4: Preserve special-feel moments without reintroducing cuts**

If needed, allow small per-chapter modifiers such as:
- mild FOV changes
- orbit radius changes
- burst intensity

These should layer on top of the rail, not replace it.

- [ ] **Step 5: Run the build**

Run: `npm run build`

Expected: Build succeeds and the scene compiles with the new rail system.

### Task 3: Tune continuity pacing

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/beatConfig.ts`
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Lengthen short-lived transition chapters where needed**

Increase `scrollWeight` on any transition chapters that still feel too abrupt, especially in:
- `planetDive`
- `gridGather`
- `spheresRise`
- `continentsCollapse`
- `tunnelEntry`
- `cityBurst`

- [ ] **Step 2: Smooth rail segment joins**

Use easing and neighboring control point influence so chapter boundaries do not create visible motion discontinuities.

- [ ] **Step 3: Keep text changes independent of rail movement**

Make sure text still fades by chapter while camera motion remains continuous.

- [ ] **Step 4: Run the build**

Run: `npm run build`

Expected: Build succeeds.

### Task 4: Final verification and local review

**Files:**
- Verify: `tree-fbx-demo/new-scroll-exp`

- [ ] **Step 1: Run the final production build**

Run: `npm run build`

Expected: Successful Vite output in `dist/`

- [ ] **Step 2: Refresh the local app**

Open or refresh: `http://127.0.0.1:4173/`

- [ ] **Step 3: Manual continuity checklist**

Check:
- camera no longer feels like it resets at chapter boundaries
- transitions feel longer and more lived in
- first half reads as one connected world journey
- second half reads as one connected growth / tunnel / city passage
- text can disappear without causing motion to feel cut
