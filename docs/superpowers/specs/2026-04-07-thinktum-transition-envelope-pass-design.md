# Thinktum Transition Envelope Pass Design

Date: 2026-04-07

## Goal

Make the major particle transitions feel like one magical unstable event instead of two separate readable scenes stitched together.

## Problem

The current transitions still read as:

- old form stays coherent too long
- new form becomes readable too quickly

Even when timing is lengthened, the user still perceives a cut because the middle does not stay ambiguous long enough.

## Design

Each major particle transition should use a shared continuity envelope with four internal phases:

1. Destabilize
2. Crossover
3. Emerge
4. Settle

The desired visual behavior is:

- readable destabilization
- ambiguous crossover dwell
- staggered particle reassignment
- silhouette overlap
- delayed emergence of the next form
- stronger residue from the previous state

## Implementation Direction

Apply this first to the world transitions:

- planet -> grid
- grid -> spheres
- spheres -> continents
- continents -> rain

The camera path can remain as-is for this pass. The change should happen primarily in particle transition behavior.

## Transition Rules

### Destabilize

The previous form should remain readable, but outer particles should begin loosening before the main reassignment begins.

### Crossover

Not all particles should switch at once. A per-particle stagger should create waves of reassignment so the middle feels storm-like and intentional.

### Emerge

The next form should not become fully legible too early. It should arrive gradually after the crossover has already begun.

### Settle

The final silhouette should resolve late and cleanly.

## Success Criteria

This pass is successful when:

- major transitions no longer feel like hard scene cuts
- the unstable middle lasts longer than the current implementation
- old and new silhouettes overlap in a readable way
- the magical storm feeling is preserved
- the next form emerges late instead of snapping readable too early
