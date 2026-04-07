# Thinktum Continuity-First Cinematic Pass Design

Date: 2026-04-06

## Goal

Restructure the React Thinktum scroll experience so it feels like one continuous cinematic journey through connected worlds rather than a sequence of hard-cut particle scenes.

## Core Shift

The current build treats many beats as discrete target states. That makes the experience feel cut from one scene to the next.

This pass changes the underlying storytelling model:
- the camera is always moving through a world
- transitions become intentional travel chapters
- some chapters carry copy, some are nearly textless
- the user should feel inside each scene before it transforms into the next

## Scope

This pass focuses on:
- continuity and transition grammar
- camera travel behavior between major scenes
- restructuring beat timing / segmentation
- text visibility rules during transitional chapters

This pass does not primarily focus on:
- final tree beauty tuning
- city/tunnel micro-detail polish
- redesigning the UI chrome
- changing the approved copy itself

## Problem To Solve

The current experience is ending too quickly and many scenes feel like visual swaps rather than lived transitions.

Examples from the intended narrative:
- the user should move into the Saturn-like world before arriving at the grid
- the user should feel inside the waves before they gather into spheres
- the user should shift perspective around the spheres and rise into the map view
- the user should fall with the rain before the trunk rises
- the tunnel and city should feel entered and emerged from, not merely revealed

## Design Principles

### 1. The user is always inside the world

The camera should never feel like it is observing disconnected objects from a neutral outside view for long. Each world should have spatial presence.

### 2. Every transition has a verb

Each major transition must be readable in motion:
- implode
- descend
- glide
- gather
- rise
- rotate
- fall
- orbit
- enter
- emerge

### 3. Not every chapter needs text

Some transition chapters should have little or no copy so the movement itself can carry the experience.

### 4. The experience should be longer

The piece should no longer feel over in under 30 seconds. It is acceptable for the experience to become meaningfully longer if that creates stronger cinematic continuity.

## New Story Structure

Instead of one beat being one state, the experience should alternate between:
- arrival chapters
- transition chapters
- transformation chapters

This does not necessarily mean doubling every current beat, but it does mean expanding the timeline so the user can inhabit movement between scenes.

## Intended Transition Flow

### Entry -> Planet
- user arrives to the Saturn-like world
- the planet is large, alive, and spatially present

### Planet -> Grid
- the user moves inward toward or through the planet
- the planet implodes / collapses into the next world
- the grid resolves beneath and around the user rather than appearing as a hard swap

### Grid -> Spheres
- the user travels across the silk grid
- the surface begins lifting and gathering
- separate spheres pull upward from the world

### Spheres -> Continents
- the camera shifts around the spheres
- then rises and rotates upward
- the map fragments become visible from above

### Continents -> Rain
- the world loses structure
- particles fall
- the camera swings with the collapse to ground level

### Rain -> Trunk
- rain settles
- the trunk grows upward
- the camera rises with it

### Trunk -> Branches
- branch formation happens while the camera moves around the trunk
- growth and orbit are felt together

### Branches -> Full Tree
- canopy fills
- world stabilizes
- the tree breathes before the next move

### Tree -> Roots
- camera drops beneath the base
- roots connect and guide the eye toward entry

### Roots -> Tunnel
- camera aligns with the opening
- entry is felt, not cut

### Tunnel -> City
- the user passes through the connected tunnel chambers
- then bursts out and pulls back into the city reveal

## Text Visibility Rules

### Arrival chapters
- carry headline and support copy
- act as narrative anchor points

### Transition chapters
- may reduce support text
- may remove text entirely
- motion becomes the storytelling device

### Long travel chapters
- should avoid feeling over-explained
- copy should not compete with the camera path

## Architecture Direction

The current beat model should be expanded so the app can independently control:
- particle formation target
- camera path
- text visibility
- chapter duration

This means the experience needs richer chapter definitions than the current one-beat-one-state structure.

## Success Criteria

This pass is successful when:
- the experience no longer feels like scene cuts
- the user feels inside each world before it transforms
- multiple transitions are long enough to breathe
- some sections intentionally carry little or no text
- the entire piece feels more cinematic and longer than the current build

## Risks

- expanding the timeline without strong motion design could make the piece feel slow rather than cinematic
- too many transitional chapters could make the narrative feel diluted if not anchored by key arrival beats
- text removal in the wrong places could make the story harder to follow

## Non-Goals

- rewriting the approved copy
- rebuilding the whole visual system from scratch
- solving every beat’s beauty issues before continuity is fixed
