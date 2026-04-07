# Thinktum Continuity-First Cinematic Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the React Thinktum scroll experience so the user travels through connected cinematic chapters instead of jumping between hard-cut particle scenes.

**Architecture:** Expand the current beat model into a richer chapter timeline that separates formation target, camera travel, and text visibility. Keep the existing React/Vite/Three.js architecture, but refactor the scroll mapping and scene logic so transitions become real travel states with their own durations and reduced or hidden copy where appropriate.

**Tech Stack:** React 18, TypeScript, Vite 5, Three.js 0.136, FBXLoader, MeshSurfaceSampler

---

## File Structure

- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/beatConfig.ts`
  - Expand the narrative model from simple beats to richer chapters with text/no-text control
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/useScrollProgress.ts`
  - Map scroll to the new chapter structure
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ChromeOverlay.tsx`
  - Respect hidden or reduced text during transition chapters
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ScrollExperience.tsx`
  - Keep cards aligned to the new chapter model
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
  - Rework camera-path logic and chapter handoffs for continuity
- Verify: `tree-fbx-demo/new-scroll-exp/package.json`
  - Use the existing build script for verification

### Task 1: Expand beat definitions into cinematic chapters

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/beatConfig.ts`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Replace the current simple beat interface with a chapter model**

Update `beatConfig.ts` so each entry can describe text visibility and transition intent:

```ts
export interface BeatConfig {
  id: number;
  formation: string;
  headline: string;
  support: string;
  scrollWeight: number;
  chapterType: "arrival" | "transition" | "hybrid";
  textMode: "full" | "headline" | "hidden";
  cameraMode: string;
}
```

- [ ] **Step 2: Expand the beat list to include transition chapters between major formations**

Restructure the sequence so it contains both anchor chapters and travel chapters. Preserve the approved copy on the major arrivals, but introduce text-light or textless transitions between them.

At minimum, split these handoffs into distinct chapters:
- planet arrival
- planet implode / descend to grid
- grid arrival / grid traversal
- grid gather into spheres
- spheres arrival
- spheres rise / rotate into map
- map arrival
- map collapse to rain
- rain arrival
- rain settle into trunk
- trunk arrival
- trunk orbit into branches
- branches arrival
- branches fill into full tree
- full tree arrival
- tree drop into roots
- roots arrival / align to tunnel
- tunnel entry / tunnel travel
- city emergence / city arrival

- [ ] **Step 3: Keep beat-card chapters explicitly mapped**

Ensure LIZ cards still attach to the tree-orbit chapter and tunnel cards still attach to the tunnel-travel chapter. If needed, keep the existing card arrays but update comments/documentation so they point to the new chapter ids.

- [ ] **Step 4: Run the build to confirm the chapter definitions compile**

Run: `npm run build`

Expected: Build succeeds after the beat model changes, even if scene logic has not yet been updated to use every new field.

### Task 2: Update scroll mapping and overlay behavior for text-light transition chapters

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/useScrollProgress.ts`
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ChromeOverlay.tsx`
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ScrollExperience.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Keep scroll progress mapping compatible with the larger chapter list**

Update `useScrollProgress.ts` so the current chapter index, local progress, and counter still behave correctly with more entries. Keep the overall API stable for consumers:

```ts
export interface ScrollState {
  globalProgress: number;
  beatIndex: number;
  localProgress: number;
  counter: string;
}
```

The implementation may still use `beatIndex` as the active chapter index to avoid a broader rename.

- [ ] **Step 2: Make the overlay respect text visibility per chapter**

In `ChromeOverlay.tsx`, use `textMode` so:
- `full` shows headline + support
- `headline` shows only headline or very minimal copy
- `hidden` fades both out

The transitions should not snap; reuse the current opacity transitions.

- [ ] **Step 3: Keep card visibility aligned to the new chapter indices**

In `ScrollExperience.tsx`, update the active-card logic so:
- LIZ cards show on the new tree-orbit chapter
- tunnel cards show on the new tunnel-travel chapter

Keep the rest of the root structure intact.

- [ ] **Step 4: Run the build after the scroll/overlay update**

Run: `npm run build`

Expected: Build succeeds and overlay logic compiles against the richer chapter model.

### Task 3: Rework camera continuity in the particle scene

**Files:**
- Modify: `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- Test: `tree-fbx-demo/new-scroll-exp/package.json`

- [ ] **Step 1: Update morph-target interpretation to support transitional chapters**

Keep the current particle formations, but allow multiple chapters to share the same underlying formation target while the camera does different things.

Example approach:
- planet arrival and planet implode chapters can both target the planet formation
- grid arrival and grid traversal can both target the grid formation
- spheres arrival and spheres-to-map rise can both target the sphere formation

The key is that continuity now comes from camera travel and timing, not only target-state changes.

- [ ] **Step 2: Replace the current per-beat camera switch with a longer chapter-based cinematic path**

Refactor `updateCamera(...)` so the camera path is authored across the expanded chapters. Major requirements:
- planet: arrive close to the Saturn world, then move inward/downward before grid
- grid: low horizon traversal before spheres gather
- spheres: wide view, then rise/rotate toward top-down map view
- map: top-down read before collapse
- rain: sharp drop to horizon
- trunk/branches/full tree: rise / orbit / fill as separate motions
- roots: descend below and align toward entry
- tunnel: true forward travel through the corridor
- city: emerge and settle into the skyline

- [ ] **Step 3: Increase continuity by smoothing chapter handoffs**

Where needed, blend camera positions/look targets between adjacent chapters rather than resetting them abruptly. The user should feel persistent travel, not teleports.

- [ ] **Step 4: Run the build after the camera-path refactor**

Run: `npm run build`

Expected: Build succeeds and the scene compiles with the new chapter structure.

### Task 4: Final verification and local continuity review

**Files:**
- Verify: `tree-fbx-demo/new-scroll-exp`

- [ ] **Step 1: Run the final production build**

Run: `npm run build`

Expected: Successful Vite output in `dist/`

- [ ] **Step 2: Use the local app for manual review**

Open or refresh: `http://127.0.0.1:4173/`

Check:
- the experience feels longer
- transitions feel lived-in rather than cut
- some chapters breathe with reduced or hidden text
- the camera feels like it is entering, descending, gliding, orbiting, dropping, or emerging instead of snapping
