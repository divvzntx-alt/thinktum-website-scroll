# Thinktum Saturn, Map, and Tree Pass Design

Date: 2026-04-06

## Goal

Refine the React Thinktum scroll experience so the opening planet regains its Saturn-like feel, the later sphere beat uses smaller versions of that same sphere language, the flat geography beat reads like broken country/state fragments, and the tree stages become cleaner now that the correct autumn tree asset is in use.

## Scope

This is a focused formation pass. It does not change:
- the approved beat order
- the copy
- the overlay structure
- the React/Vite architecture

This pass does change:
- beat 0 planet target
- the later sphere beat target
- the flat geography-like beat target
- the tree stage shaping now that the correct autumn tree asset is loaded

## Confirmed Asset Change

The tree source mismatch has already been corrected:
- active tree asset is now the autumn tree at `tree-fbx-demo/TR_01_autumn.fbx`
- the React app serves it from `tree-fbx-demo/new-scroll-exp/public/models/tree.fbx`

This pass assumes the autumn tree remains the source of truth.

## Problems To Solve

### 1. Opening planet lost its Saturn read

The first scene was originally understood as a Saturn-like sphere with a ring. The latest tightening pass over-compressed that scene and removed too much of its ring identity.

Desired outcome:
- restore a readable planet body
- restore a clean ring around it
- keep it slightly tighter than the loose earlier version, but not collapsed into a dense ball

### 2. Small spheres should inherit the same sphere language

The later sphere beat should feel like several smaller versions of the first scene’s spherical body, not unrelated particle clusters.

Desired outcome:
- spheres match beat 0’s visual logic
- spheres are clearly round
- spheres remain smaller and separated

### 3. Geography beat should read as disintegrated states/countries

The current flat shapes are too soft and blob-like. The intended feeling is broken map fragments from a top-down view, like separated countries or states, without referencing any one real map.

Desired outcome:
- top-down read feels geographic
- fragments are clearly separated
- silhouettes are irregular enough to feel like land regions rather than ovals

### 4. Tree stages need cleanup with the correct autumn tree

Now that the right tree is loaded, the staged reveal can be tuned against its actual silhouette.

Desired outcome:
- trunk stage reads upright and stable
- branch stage grows cleanly without a cupped canopy artifact
- full tree keeps the graceful autumn silhouette
- overall result feels closer to the beautiful Lovable tree

## Design Approach

### Keep the narrative exactly as approved

No copy or beat sequencing changes are introduced in this pass.

### Use family resemblance across sphere-based beats

Beat 0 and the later sphere beat should clearly feel related:
- same particle language
- same sense of volume
- same kind of spherical read

Beat 0 differs by having a ring and by presenting as a singular hero object.
The later beat differs by dividing that language into multiple smaller sphere bodies.

### Replace soft geography blobs with authored fragment fields

The geography beat should no longer rely on loosely elliptical distributions alone.

Instead, it should use:
- separated fragment anchors
- irregular boundaries
- low vertical spread
- enough negative space between shapes that the eye reads them as distinct regions

### Re-tune tree stages using the autumn silhouette

The tree logic should be relaxed compared with the over-compressed winter-tree pass.

Guiding principles:
- preserve the natural asymmetry of the autumn canopy
- avoid over-collapsing hidden particles into a bright base strip
- let the full tree breathe more
- keep stage transitions readable without deforming the source too aggressively

## Intended Beat Behaviors

### Beat 0: Saturn-like planet
- dense spherical body
- thin, readable ring
- not overly wide
- not fully collapsed

### Sphere beat
- multiple smaller planet-body-like forms
- clean round silhouettes
- strong separation

### Geography beat
- fragmented region shapes
- top-down reading
- irregular, map-like negative space

### Tree stages
- trunk: compact, upright, centered
- branches: trunk preserved, but the branch stage should be noticeably narrower than the full tree so it reads as a separate reveal rather than nearly the whole canopy
- roots: should read as a roots-focused composition, not the full tree silhouette with a slightly exaggerated base
- full tree: graceful autumn silhouette with a light, natural spread

## Success Criteria

This pass is successful when:
- beat 0 clearly reads as a Saturn-like planet again
- the small spheres feel like smaller relatives of the opening sphere body
- the geography beat reads like broken state/country fragments from above
- the tree stages become cleaner and more elegant
- the branch stage is visually distinct from the full tree
- the roots stage reads as a focused root/base composition rather than the entire tree
- the full tree feels closer to the previous beautiful Lovable look

## Risks

- Reintroducing the ring could make beat 0 too loose again if not balanced carefully
- Map fragments could feel too literal or too abstract if boundary shaping is off
- Loosening the full tree too much could reintroduce the spread problem

## Non-Goals

- redesigning the city or tunnel
- changing the UI chrome
- changing copy or beat order
- swapping in real geographic datasets or map files
