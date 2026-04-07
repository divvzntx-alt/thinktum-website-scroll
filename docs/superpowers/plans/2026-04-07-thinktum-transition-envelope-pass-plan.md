# Thinktum Transition Envelope Pass Plan

Date: 2026-04-07

## Goal

Revise the major particle transitions so they preserve a magical storm-like middle and avoid separate-scene cuts.

## Steps

1. Add per-particle stagger data to the point geometry.
2. Replace the simple transition blend with a phased transition envelope in the shader.
3. Drive world-transition morph state from shared transition ranges, not beat-local switches.
4. Verify the build.

## Notes

- Focus on the world transitions first.
- Do not redesign the scene structure in this pass.
- Preserve the existing camera rails unless a tiny adjustment is needed to support the new transition envelope.
