# Tree Passage Design

## Goal

Rebuild the current demo as a chaptered 3D passage instead of a particle morph. The experience should begin with drifting particles that gather into a readable tree, complete the roots, allow the user to orbit around the formed tree for a short hero moment, and then transition into a guided inward journey through the tree, into the tunnel, and finally into the city.

## Scope

The work applies to `/Users/divyachakravarthy/Documents/Playground/tree-fbx-demo/morph-scroll-demo.html` and will use the FBX assets already placed in the folder:

- `/Users/divyachakravarthy/Documents/Playground/tree-fbx-demo/Oak_Winter_4.fbx`
- `/Users/divyachakravarthy/Documents/Playground/tree-fbx-demo/uploads_files_4491922_Tunnel.fbx`
- `/Users/divyachakravarthy/Documents/Playground/tree-fbx-demo/Dallas_City.fbx`

The old tree-tunnel-city morph logic is out of scope for the new build. The new experience will be a staged journey through anchored spaces.

## Narrative Structure

- drifting particles in space
- particles cluster into the tree silhouette
- roots complete the formation
- formed tree hero moment
- user can orbit around the tree
- guided camera entry into the tree and internal network
- tunnel fly-through
- city arrival as the completed network destination

## Asset Roles

### Tree

`Oak_Winter_4.fbx` is the main opening asset because its branches and roots are the strongest visual material for the story. It will serve both as the exterior tree reveal and as the visual language for the internal network feeling.

### Tunnel

`uploads_files_4491922_Tunnel.fbx` will be used as a stable passage environment. The camera should move through it as an actual space, not as a transformed version of the tree or city.

### City

`Dallas_City.fbx` will be the destination environment. The city should be framed clearly as architecture, with enough readability to feel like arrival rather than another transitional particle state.

## Scene Design

The demo should be built from multiple anchored scene groups rather than one blended particle buffer.

- a particle effect layer for the opening drift and formation
- a real tree scene group
- a real tunnel scene group
- a real city scene group

The particle system remains important, but only as an effect layer during formation and possibly as subtle network energy. It is no longer the primary representation of all chapters.

## Camera and Interaction

### Opening and Tree Hero

The camera begins in a readable framing so the tree can form clearly. Once the particles and roots have assembled into the tree, the experience enters a hero section where the user can orbit around the tree. The tree itself does not rotate. The camera is user-controlled during this chapter only.

### Guided Journey

After the hero section, orbit control is disabled and camera control returns to the experience. The camera then moves inward through the tree, passes through the tunnel, and arrives at the city.

This preserves the cinematic narrative while still giving the user a real 3D inspection moment around the tree.

## Transition Design

The narrative is about passage, not morphing.

- tree formation is a particle-to-tree reveal
- tree-to-network is a camera-led entry
- network-to-tunnel is a spatial handoff
- tunnel-to-city is a destination arrival

At no point should the tunnel or city feel like they are being mathematically blended out of the tree.

## Visual Intent

- particles should feel atmospheric and alive at the beginning
- the tree should become clearly readable before the user enters it
- the roots should visibly finish the formation
- the tunnel should feel traversable and stable
- the city should feel like an arrival into a larger system

## Risks

- the tunnel and city assets may need centering, scale adjustment, or camera-path tuning before they read well
- the tree formation may need staged density control so it does not become a noisy blob before the silhouette resolves
- handing off from orbit mode to guided mode will need to feel intentional rather than abrupt

## Verification

After implementation, verify:

- the tree is clearly readable before entry
- roots visibly complete the formation
- the user can orbit around the tree during the hero section
- the tree does not spin on its own
- the guided journey resumes after the hero section
- the tunnel reads as a real passage
- the city reads as a destination environment
