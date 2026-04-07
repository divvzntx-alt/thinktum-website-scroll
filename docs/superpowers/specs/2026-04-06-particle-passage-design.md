# Particle Passage Design

## Goal

Rebuild the current demo as a particle-only passage. The FBX files remain useful, but only as hidden sampling sources for particle positions. No solid tree, tunnel, or city mesh should remain visible during the experience.

## Scope

The work applies to `/Users/divyachakravarthy/Documents/Playground/tree-fbx-demo/morph-scroll-demo.html` and uses these source assets only for point sampling:

- `/Users/divyachakravarthy/Documents/Playground/tree-fbx-demo/Oak_Winter_4.fbx`
- `/Users/divyachakravarthy/Documents/Playground/tree-fbx-demo/uploads_files_4491922_Tunnel.fbx`
- `/Users/divyachakravarthy/Documents/Playground/tree-fbx-demo/Dallas_City.fbx`

The output should feel like a polished particle experience, not an FBX viewer.

## Narrative Structure

- drifting atmospheric particles
- particles cluster into the tree silhouette
- roots visibly complete the tree form
- short orbitable hero moment around the particle tree
- tree particles thin into an internal network
- guided movement through particle tunnel space
- emergence into particle city space

## Rendering Model

The scene should render particles only.

- the tree asset is sampled into a dense tree point cloud
- the tree also provides a sparser interior-network point cloud
- the tunnel asset is sampled into a tunnel point cloud
- the city asset is sampled into a city point cloud
- the original FBX meshes are hidden after sampling

The goal is to preserve real silhouettes from the assets while keeping the final render entirely particle-based.

## Interaction and Camera

The tree hero section still allows user orbit around the formed particle tree. The camera then returns to guided movement for the inward journey. Because the scene is particle-only, the camera should no longer get visually trapped inside opaque branches or walls.

## Visual Intent

- tree should read clearly as a real tree, not a generic cone
- particles should feel precise enough to preserve silhouette
- tunnel should feel traversable and stable
- city should feel structured and legible, not like a random point cloud
- overall mood should be closer to the polished procedural particle demo than to a mesh walkthrough

## Risks

- raw sampled points may be too dense in some zones and need thinning for readability
- city data may need selective emphasis so buildings/street depth remain legible
- tunnel particles may need careful density tuning to keep the corridor readable

## Verification

After implementation, verify:

- no visible solid mesh remains
- the tree still reads as a real tree
- roots are visible in the formation
- orbit works during the hero section
- the camera no longer gets stuck in opaque geometry
- tunnel reads as a particle passage
- city reads as a particle destination
