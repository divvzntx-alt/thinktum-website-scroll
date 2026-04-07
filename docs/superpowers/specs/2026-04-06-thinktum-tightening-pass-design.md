# Thinktum Tightening Pass Design

Date: 2026-04-06

## Goal

Improve the readability and shape clarity of the existing React/Vite Thinktum scroll experience without changing its approved narrative structure or copy.

This pass is intentionally narrow:
- keep the same beat order
- keep the same headlines and support copy
- keep the same React app structure
- tighten the particle formations so each beat reads clearly
- improve the tree staging so the reveal feels intentional instead of fragmented

## Scope

Files expected to change:
- `tree-fbx-demo/new-scroll-exp/src/components/thinktum/ParticleScene.tsx`
- optional small supporting changes in nearby Thinktum components only if needed for clarity or debugging

Files explicitly not targeted in this pass unless required by implementation:
- copy and beat text
- overlay chrome structure
- card content
- tunnel and city choreography

## Problems To Solve

### 1. Planet is too loose

The opening planet formation currently reads as a broad fuzzy particle mass rather than a tighter, intentional spherical body.

Desired outcome:
- denser visual core
- fewer stray outer particles
- more immediate “planet” read

### 2. Spheres do not read as actual spheres

The current spheres beat feels like multiple random clusters instead of clearly defined individual spheres.

Desired outcome:
- six clearly separated spheres
- more consistent radius per sphere
- stronger visual spacing between sphere clusters

### 3. Middle beats are too ambiguous

The intermediate procedural formations are not visually legible enough to support their narrative beats.

Desired outcome:
- preserve the current beat labels and copy
- make each underlying formation feel more deliberate and structured
- reduce accidental blob-like or noisy shapes

This applies especially to the “gap became impossible” section and any neighboring beats whose current geometry does not read clearly at first glance.

### 4. Tree reveal is fragmented

The tree currently uses broad height-based segmentation that makes the reveal feel exploded, sparse, and only partially faithful to the source tree’s beauty.

Desired outcome:
- stage 1: trunk only
- stage 2: trunk plus branches
- stage 3: full tree with roots
- final tree should feel tighter, denser, and closer to the pleasing sampled-tree look already present in the source asset

## Design Approach

### Keep the existing narrative contract

The approved beat structure remains unchanged:
- same beat count
- same beat names
- same copy
- same scroll mapping

This is a visual tightening pass, not a narrative redesign.

### Replace weak loose formations with controlled geometry

For procedural beats, the current implementation should move away from “thematic scatter” and toward more authored particle targets.

Guidelines:
- shapes must be identifiable quickly
- particle spread should be reduced
- outer noise should be reduced
- cluster boundaries should be more intentional

### Rebuild tree stages from sampled data with stronger masks

The tree should still be sourced from the sampled FBX positions, but its staged reveal should no longer rely only on coarse height buckets.

Instead, the tightening logic should use combinations of:
- normalized height
- radial distance from trunk center
- compacting transforms for hidden or not-yet-revealed particles

Intended stage behavior:

#### Trunk stage
- prioritize lower and more central particles
- collapse unrevealed particles into a compact base/trunk volume
- avoid wide canopy leakage

#### Branch stage
- preserve the trunk from the previous stage
- reveal branch structure upward and outward
- keep canopy spread controlled so the silhouette stays readable

#### Full tree with roots stage
- reveal the full tree silhouette
- roots appear last and feel grounded rather than mirrored too aggressively
- overall tree should be tighter than the current version

## Implementation Guidance

### Planet
- compress the radial falloff
- reduce far-ring particles
- bias more particles into a stronger spherical shell/core relationship

### Spheres
- define cluster centers explicitly
- use tighter per-sphere radius constraints
- ensure all remainder particles still land inside valid sphere volumes

### Middle formations
- tune per-beat procedural layouts to create distinct silhouettes
- reduce noisy randomness where it weakens readability
- prefer structured arrangements over diffuse distributions

### Tree
- compute more useful normalized metrics from sampled tree positions
- derive trunk/branch/root targets from those metrics
- reduce overall spread in the fully assembled tree state

## Success Criteria

This pass is successful when:
- the planet reads immediately as a tight planet
- the spheres read as real spheres
- the middle beats feel visually intentional instead of vague
- the tree sequence reads clearly as trunk, then branches, then full tree with roots
- the full tree feels denser and less blown apart than the current build

## Risks

- Overtightening may make some beats feel too static or synthetic
- Tree masks that are too aggressive may remove the natural irregularity that makes the source asset beautiful
- Tightening the full tree too much may reduce readability during camera motion if not balanced carefully

## Non-Goals

- redesigning the story
- changing copy
- redesigning the tunnel or city sequences
- replacing procedural beats with imported 3D assets for this pass
