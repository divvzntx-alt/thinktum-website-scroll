import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { normalizePositions, samplePointsFromFBX } from "@/lib/meshSurfaceSampler";
import { beats } from "./beatConfig";
import type { BeatConfig } from "./beatConfig";
import type { ScrollState } from "./useScrollProgress";

const PARTICLE_COUNT = 80000;

interface ParticleSceneProps {
  scrollState: ScrollState;
  scrollStateRef: MutableRefObject<ScrollState>;
}

const ParticleScene = ({ scrollState, scrollStateRef }: ParticleSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080810);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    const gu = {
      time: { value: 0 },
      morphProgress: { value: 0 },
      sourceMorphTarget: { value: 0 },
      targetMorphTarget: { value: 0 },
      beatLocal: { value: 0 },
    };

    const sizes: number[] = [];
    const shift: number[] = [];
    const stagger: number[] = [];
    const pushShift = () => {
      shift.push(
        Math.random() * Math.PI,
        Math.random() * Math.PI * 2,
        (Math.random() * 0.9 + 0.1) * Math.PI * 0.1,
        Math.random() * 0.9 + 0.1
      );
      stagger.push(Math.random());
    };

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

    const gridPositions = new Float32Array(PARTICLE_COUNT * 3);
    const gridSize = 60;
    const gridSide = Math.ceil(Math.sqrt(PARTICLE_COUNT));
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const ix = i % gridSide;
      const iz = Math.floor(i / gridSide);
      gridPositions[i * 3] = (ix / gridSide - 0.5) * gridSize;
      gridPositions[i * 3 + 1] = 0;
      gridPositions[i * 3 + 2] = (iz / gridSide - 0.5) * gridSize;
    }

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

    const continentPositions = new Float32Array(PARTICLE_COUNT * 3);
    const mapFragments = [
      { cx: -18, cz: -6, baseR: 7.5, stretchX: 1.2, stretchZ: 0.72, wobble: 0.28, rotation: 0.24 },
      { cx: -3, cz: -8, baseR: 6.2, stretchX: 0.9, stretchZ: 1.15, wobble: 0.34, rotation: -0.18 },
      { cx: 14, cz: -2, baseR: 8.1, stretchX: 1.28, stretchZ: 0.8, wobble: 0.26, rotation: 0.1 },
      { cx: 19, cz: 9, baseR: 3.7, stretchX: 1.05, stretchZ: 0.82, wobble: 0.22, rotation: -0.12 },
      { cx: -7, cz: 10, baseR: 2.9, stretchX: 0.92, stretchZ: 0.86, wobble: 0.3, rotation: 0.14 },
    ];
    const perContinent = Math.floor(PARTICLE_COUNT / mapFragments.length);
    for (let c = 0; c < mapFragments.length; c += 1) {
      const shape = mapFragments[c];
      for (let j = 0; j < perContinent; j += 1) {
        const idx = c * perContinent + j;
        if (idx >= PARTICLE_COUNT) break;
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
      }
    }
    for (let i = perContinent * mapFragments.length; i < PARTICLE_COUNT; i += 1) {
      const shape = mapFragments[i % mapFragments.length];
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

      continentPositions[i * 3] = shape.cx + rotX;
      continentPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.22;
      continentPositions[i * 3 + 2] = shape.cz + rotZ;
    }

    const rainPositions = new Float32Array(PARTICLE_COUNT * 3);
    const laneCount = 18;
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const lane = i % laneCount;
      const laneX = (lane / (laneCount - 1) - 0.5) * 42;
      const laneZ =
        (Math.floor(i / laneCount) % laneCount) / (laneCount - 1) * 24 - 12;
      rainPositions[i * 3] = laneX + (Math.random() - 0.5) * 0.9;
      rainPositions[i * 3 + 1] = -14 + Math.random() * 8;
      rainPositions[i * 3 + 2] = laneZ + (Math.random() - 0.5) * 0.9;
    }

    const init = async () => {
      try {
        const [treeResult, tunnelResult, cityResult] = await Promise.all([
          samplePointsFromFBX("/models/tree.fbx", PARTICLE_COUNT),
          samplePointsFromFBX("/models/tunnel.fbx", PARTICLE_COUNT),
          samplePointsFromFBX("/models/city.fbx", PARTICLE_COUNT),
        ]);

        if (disposed) return;

        const treePositions = normalizePositions(treeResult.positions, treeResult.bounds, 15);
        const tunnelPositions = normalizePositions(tunnelResult.positions, tunnelResult.bounds, 20);
        const cityPositions = normalizePositions(cityResult.positions, cityResult.bounds, 15);

        const treeBounds = new THREE.Box3();
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          treeBounds.expandByPoint(
            new THREE.Vector3(
              treePositions[i * 3],
              treePositions[i * 3 + 1],
              treePositions[i * 3 + 2]
            )
          );
        }
        const treeMin = treeBounds.min.y;
        const treeHeight = treeBounds.max.y - treeBounds.min.y;
        const lowerTreeTighten = 0.96;
        const midTreeTighten = 0.985;
        const trunkMaxHeight = 0.5;
        const trunkBaseRadius = 2.6;
        const trunkHeightRadiusGain = 4.4;
        const branchMaxHeight = 0.84;
        const branchBaseRadius = 8.6;
        const branchHeightRadiusGain = 5.2;
        const rootMaxHeight = 0.15;
        const rootBaseRadius = 5.8;
        const rootHeightRadiusGain = 2.1;

        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const relH =
            (treePositions[i * 3 + 1] - treeMin) / Math.max(treeHeight, 0.0001);
          const tighten =
            relH < 0.35 ? lowerTreeTighten : relH < 0.72 ? midTreeTighten : 1.0;
          treePositions[i * 3] *= tighten;
          treePositions[i * 3 + 2] *= tighten;
        }

        const trunkPositions = new Float32Array(PARTICLE_COUNT * 3);
        const branchPositions = new Float32Array(PARTICLE_COUNT * 3);
        const rootPositions = new Float32Array(PARTICLE_COUNT * 3);
        const treeMetrics = new Array<{
          x: number;
          y: number;
          z: number;
          relH: number;
          radial: number;
        }>(PARTICLE_COUNT);
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const x = treePositions[i * 3];
          const y = treePositions[i * 3 + 1];
          const z = treePositions[i * 3 + 2];
          const relH = (y - treeMin) / Math.max(treeHeight, 0.0001);
          const radial = Math.sqrt(x * x + z * z);
          treeMetrics[i] = { x, y, z, relH, radial };
        }

        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          const { x, y, z, relH, radial } = treeMetrics[i];
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
            trunkPositions[i * 3 + 1] =
              treeMin + Math.min(relH, 0.22) * treeHeight * 0.62;
            trunkPositions[i * 3 + 2] = z * 0.18;
          }

          if (isBranch) {
            branchPositions[i * 3] = x * 0.99;
            branchPositions[i * 3 + 1] = y;
            branchPositions[i * 3 + 2] = z * 0.99;
          } else {
            branchPositions[i * 3] = x * 0.58;
            branchPositions[i * 3 + 1] =
              treeMin + treeHeight * (0.28 + relH * 0.38);
            branchPositions[i * 3 + 2] = z * 0.58;
          }

          if (isRoot) {
            rootPositions[i * 3] = x * 1.04;
            rootPositions[i * 3 + 1] =
              treeMin - (treeMin + treeHeight * 0.14 - y) * 0.82;
            rootPositions[i * 3 + 2] = z * 1.04;
          } else {
            rootPositions[i * 3] = x * 0.24;
            rootPositions[i * 3 + 1] =
              treeMin + Math.min(relH, 0.18) * treeHeight * 0.12;
            rootPositions[i * 3 + 2] = z * 0.24;
          }
        }

        const tunnelBounds = new THREE.Box3();
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          tunnelBounds.expandByPoint(
            new THREE.Vector3(
              tunnelPositions[i * 3],
              tunnelPositions[i * 3 + 1],
              tunnelPositions[i * 3 + 2]
            )
          );
        }
        const tunnelCenter = tunnelBounds.getCenter(new THREE.Vector3());
        const tunnelSize = tunnelBounds.getSize(new THREE.Vector3());
        let tunnelAxis: "x" | "y" | "z" = "z";
        let tunnelLength = tunnelSize.z;
        if (tunnelSize.x > tunnelSize.y && tunnelSize.x > tunnelSize.z) {
          tunnelAxis = "x";
          tunnelLength = tunnelSize.x;
        } else if (tunnelSize.y > tunnelSize.x && tunnelSize.y > tunnelSize.z) {
          tunnelAxis = "y";
          tunnelLength = tunnelSize.y;
        }

        const cityBounds = new THREE.Box3();
        for (let i = 0; i < PARTICLE_COUNT; i += 1) {
          cityBounds.expandByPoint(
            new THREE.Vector3(
              cityPositions[i * 3],
              cityPositions[i * 3 + 1],
              cityPositions[i * 3 + 2]
            )
          );
        }
        const cityCenter = cityBounds.getCenter(new THREE.Vector3());
        const citySize = cityBounds.getSize(new THREE.Vector3());

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(galaxyPositions, 3));
        geometry.setAttribute("sizes", new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute("shift", new THREE.Float32BufferAttribute(shift, 4));
        geometry.setAttribute("aStagger", new THREE.Float32BufferAttribute(stagger, 1));
        geometry.setAttribute("aGrid", new THREE.Float32BufferAttribute(gridPositions, 3));
        geometry.setAttribute("aSpheres", new THREE.Float32BufferAttribute(spherePositions, 3));
        geometry.setAttribute("aContinents", new THREE.Float32BufferAttribute(continentPositions, 3));
        geometry.setAttribute("aRain", new THREE.Float32BufferAttribute(rainPositions, 3));
        geometry.setAttribute("aTrunk", new THREE.Float32BufferAttribute(trunkPositions, 3));
        geometry.setAttribute("aBranches", new THREE.Float32BufferAttribute(branchPositions, 3));
        geometry.setAttribute("aTree", new THREE.Float32BufferAttribute(treePositions, 3));
        geometry.setAttribute("aRoots", new THREE.Float32BufferAttribute(rootPositions, 3));
        geometry.setAttribute("aTunnel", new THREE.Float32BufferAttribute(tunnelPositions, 3));
        geometry.setAttribute("aCity", new THREE.Float32BufferAttribute(cityPositions, 3));

        const material = new THREE.PointsMaterial({
          size: 0.07,
          transparent: true,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        });

        material.onBeforeCompile = (shader) => {
          material.userData.shader = shader;
          shader.uniforms.time = gu.time;
          shader.uniforms.morphProgress = gu.morphProgress;
          shader.uniforms.sourceMorphTarget = gu.sourceMorphTarget;
          shader.uniforms.targetMorphTarget = gu.targetMorphTarget;
          shader.uniforms.beatLocal = gu.beatLocal;

          shader.vertexShader = `
            uniform float time;
            uniform float morphProgress;
            uniform float sourceMorphTarget;
            uniform float targetMorphTarget;
            uniform float beatLocal;
            attribute float sizes;
            attribute float aStagger;
            attribute vec4 shift;
            attribute vec3 aGrid;
            attribute vec3 aSpheres;
            attribute vec3 aContinents;
            attribute vec3 aRain;
            attribute vec3 aTrunk;
            attribute vec3 aBranches;
            attribute vec3 aTree;
            attribute vec3 aRoots;
            attribute vec3 aTunnel;
            attribute vec3 aCity;
            varying vec3 vColor;

            vec3 getTarget(float target) {
              if (target < 0.5) return position;
              if (target < 1.5) return aGrid;
              if (target < 2.5) return aSpheres;
              if (target < 3.5) return aContinents;
              if (target < 4.5) return aRain;
              if (target < 5.5) return aTrunk;
              if (target < 6.5) return aBranches;
              if (target < 7.5) return aTree;
              if (target < 8.5) return aTree;
              if (target < 9.5) return aRoots;
              if (target < 10.5) return aTunnel;
              return aCity;
            }

            vec3 getColor(float target, vec3 pos) {
              if (target < 0.5) {
                float dg = length(abs(pos) / vec3(40., 10., 40.));
                return mix(vec3(0.89, 0.61, 0.), vec3(0.39, 0.2, 1.), clamp(dg, 0., 1.));
              }
              if (target < 1.5) return vec3(1., 1., 1.) * 0.35;
              if (target < 2.5) return vec3(1., 1., 1.) * 0.35;
              if (target < 3.5) return vec3(1., 1., 1.) * 0.35;
              if (target < 4.5) return vec3(1., 1., 1.) * 0.35;
              if (target < 5.5) return vec3(0.976, 0.624, 0.788);
              if (target < 6.5) return vec3(0.976, 0.624, 0.788);
              if (target < 8.5) {
                float h = clamp((pos.y + 7.5) / 15., 0., 1.);
                return mix(vec3(0.976, 0.624, 0.788), vec3(0.549, 0.392, 0.863), smoothstep(0.2, 0.6, h));
              }
              if (target < 9.5) return mix(vec3(0.976, 0.624, 0.788), vec3(0.318, 0.165, 0.267), 0.3);
              if (target < 10.5) {
                float d = clamp((pos.z + 10.) / 20., 0., 1.);
                return mix(vec3(0.318, 0.165, 0.267), vec3(1., 0.722, 0.11), d);
              }
              float h = clamp(pos.y / 15., 0., 1.);
              return mix(vec3(1., 0.722, 0.11), vec3(0.976, 0.624, 0.788), smoothstep(0.3, 0.8, h));
            }

            float getTransitionBlend(float globalT, float bias) {
              float delayed = clamp((globalT - bias * 0.22) / max(0.78 - bias * 0.1, 0.0001), 0.0, 1.0);
              return smoothstep(0.18, 0.92, delayed);
            }

            ${shader.vertexShader}
          `
            .replace(
              "gl_PointSize = size;",
              "gl_PointSize = size * sizes * (1.0 - morphProgress * 0.3);"
            )
            .replace(
              "#include <begin_vertex>",
              `#include <begin_vertex>
              float t = time;
              float moveT = mod(shift.x + shift.z * t, 6.2831853);
              float moveS = mod(shift.y + shift.z * t, 6.2831853);
              vec3 wobble = vec3(cos(moveS) * sin(moveT), cos(moveT), sin(moveS) * sin(moveT)) * shift.w;

              vec3 gridTarget = aGrid;
              float waveY = sin(aGrid.x * 0.3 + t * 2.0) * cos(aGrid.z * 0.25 + t * 1.5) * 1.5;
              waveY += sin(aGrid.x * 0.15 - t * 1.2) * 0.8;
              gridTarget.y = waveY;

              vec3 sourceTarget = getTarget(sourceMorphTarget);
              vec3 targetTarget = getTarget(targetMorphTarget);
              if (sourceMorphTarget > 0.5 && sourceMorphTarget < 1.5) sourceTarget = gridTarget;
              if (targetMorphTarget > 0.5 && targetMorphTarget < 1.5) targetTarget = gridTarget;

              float destabilize = smoothstep(0.02, 0.28, morphProgress) * (1.0 - smoothstep(0.48, 0.82, morphProgress));
              float emerge = smoothstep(0.46, 0.9, morphProgress);
              float settle = smoothstep(0.82, 1.0, morphProgress);
              float residue = 1.0 - smoothstep(0.52, 0.96, morphProgress);
              float blend = getTransitionBlend(morphProgress, aStagger);

              vec3 sourceDir = normalize(vec3(sourceTarget.x + 0.001, sourceTarget.y * 0.5 + 0.001, sourceTarget.z + 0.001));
              vec3 transferDir = normalize(targetTarget - sourceTarget + vec3(0.001));

              vec3 sourceLoose = sourceTarget
                + wobble * (0.22 + destabilize * 2.0)
                + sourceDir * destabilize * 0.9;

              vec3 targetVeil = targetTarget
                + wobble * mix(1.9, 0.1, emerge)
                + transferDir * (1.0 - emerge) * 1.4;

              vec3 sourceState = mix(sourceTarget, sourceLoose, destabilize);
              vec3 targetState = mix(targetVeil, targetTarget, settle);
              vec3 morphed = mix(sourceState, targetState, blend);
              morphed = mix(morphed, sourceState, residue * (1.0 - blend) * 0.45);
              transformed = morphed;`
            )
            .replace(
              "#include <color_vertex>",
              `#include <color_vertex>
              vec3 sourcePos = getTarget(sourceMorphTarget);
              vec3 targetPos = getTarget(targetMorphTarget);
              if (sourceMorphTarget > 0.5 && sourceMorphTarget < 1.5) {
                float waveY = sin(aGrid.x * 0.3 + time * 2.0) * cos(aGrid.z * 0.25 + time * 1.5) * 1.5;
                sourcePos.y = waveY;
              }
              if (targetMorphTarget > 0.5 && targetMorphTarget < 1.5) {
                float waveY = sin(aGrid.x * 0.3 + time * 2.0) * cos(aGrid.z * 0.25 + time * 1.5) * 1.5;
                targetPos.y = waveY;
              }
              vec3 galaxyColor = vec3(0.89, 0.61, 0.);
              float dg = length(abs(sourcePos) / vec3(40., 10., 40.));
              galaxyColor = mix(vec3(0.89, 0.61, 0.), vec3(0.39, 0.2, 1.), clamp(dg, 0., 1.));
              vec3 sourceColor = sourceMorphTarget < 0.5 ? galaxyColor : getColor(sourceMorphTarget, sourcePos);
              vec3 targetColor = getColor(targetMorphTarget, targetPos);
              float colorBlend = getTransitionBlend(morphProgress, aStagger);
              float colorResidue = 1.0 - smoothstep(0.58, 0.98, morphProgress);
              vColor = mix(sourceColor, targetColor, colorBlend);
              vColor = mix(vColor, sourceColor, colorResidue * (1.0 - colorBlend) * 0.35);`
            );

          shader.fragmentShader = `
            varying vec3 vColor;
            ${shader.fragmentShader}
          `
            .replace(
              "#include <clipping_planes_fragment>",
              `#include <clipping_planes_fragment>
              float d = length(gl_PointCoord.xy - 0.5);`
            )
            .replace(
              "vec4 diffuseColor = vec4( diffuse, opacity );",
              "vec4 diffuseColor = vec4(vColor, smoothstep(0.5, 0.1, d));"
            );
        };

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        const treeCenter = new THREE.Vector3(0, treeMin + treeHeight * 0.5, 0);
        const ease = (value: number) => value * value * (3 - 2 * value);

        const clock = new THREE.Clock();

        // Persistent camera state — lerped each frame so any positional discontinuity
        // at beat or rail boundaries becomes a smooth drift rather than a hard snap.
        const camPos = new THREE.Vector3(0, 0, 40);
        const camLook = new THREE.Vector3(0, 0, 0);
        const CAMERA_LERP = 0.2;

        const animate = () => {
          if (disposed) return;

          requestAnimationFrame(animate);

          const t = clock.getElapsedTime() * 0.5;
          gu.time.value = t * Math.PI;

          const { beatIndex, localProgress } = scrollStateRef.current;
          const activeBeat = beats[beatIndex];
          const morphState = getMorphState(activeBeat, localProgress, beatIndex);

          gu.sourceMorphTarget.value = getFormationTargetIndex(morphState.sourceFormation);
          gu.targetMorphTarget.value = getFormationTargetIndex(morphState.targetFormation);
          gu.morphProgress.value = ease(morphState.progress);
          gu.beatLocal.value = localProgress;

          if (beatIndex <= 1) {
            points.rotation.y = t * 0.05;
            points.rotation.z = 0.2;
          } else {
            points.rotation.y += (0 - points.rotation.y) * 0.02;
            points.rotation.z += (0 - points.rotation.z) * 0.02;
          }

          const camTarget = updateCamera(
            activeBeat,
            localProgress,
            t,
            treeCenter,
            treeMin,
            treeHeight,
            tunnelCenter,
            tunnelLength,
            tunnelAxis,
            cityCenter,
            citySize
          );

          camPos.lerp(camTarget.position, CAMERA_LERP);
          camLook.lerp(camTarget.lookAt, CAMERA_LERP);
          camera.position.copy(camPos);
          camera.lookAt(camLook);
          camera.fov += (camTarget.fov - camera.fov) * 0.08;
          camera.updateProjectionMatrix();

          renderer.render(scene, camera);
        };

        animate();

        return () => {
          geometry.dispose();
          material.dispose();
        };
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };

    init();

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollStateRef]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

function getFormationTargetIndex(formation: string): number {
  switch (formation) {
    case "planet":
      return 0;
    case "grid":
      return 1;
    case "spheres":
      return 2;
    case "continents":
      return 3;
    case "rain":
      return 4;
    case "trunk":
      return 5;
    case "branches":
      return 6;
    case "tree":
      return 7;
    case "roots":
      return 9;
    case "tunnel":
      return 10;
    case "city":
      return 11;
    default:
      return 0;
  }
}

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value);
}

function samplePolyline(points: THREE.Vector3[], progress: number): THREE.Vector3 {
  if (points.length === 1) {
    return points[0].clone();
  }

  const clamped = THREE.MathUtils.clamp(progress, 0, 1);
  const scaled = clamped * (points.length - 1);
  const index = Math.min(Math.floor(scaled), points.length - 2);
  const local = smoothStep(scaled - index);

  return points[index].clone().lerp(points[index + 1], local);
}

function sampleCurve(points: THREE.Vector3[], progress: number): THREE.Vector3 {
  if (points.length <= 2) {
    return samplePolyline(points, progress);
  }

  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.18);
  return curve.getPoint(THREE.MathUtils.clamp(progress, 0, 1));
}

function remapProgress(
  progress: number,
  start: number,
  end: number,
  easing: (value: number) => number = smoothStep
): number {
  const normalized = THREE.MathUtils.clamp(
    (progress - start) / Math.max(end - start, 0.0001),
    0,
    1
  );
  return easing(normalized);
}

function getMorphState(
  beat: BeatConfig,
  localProgress: number,
  beatIndex: number
): { sourceFormation: BeatConfig["formation"]; targetFormation: BeatConfig["formation"]; progress: number } {
  const railProgress = THREE.MathUtils.clamp(
    THREE.MathUtils.lerp(beat.railStart, beat.railEnd, localProgress),
    0,
    1
  );

  if (beat.rail === "world") {
    if (railProgress < 0.18) {
      return { sourceFormation: "planet", targetFormation: "planet", progress: 1 };
    }
    if (railProgress < 0.38) {
      return {
        sourceFormation: "planet",
        targetFormation: "grid",
        progress: remapProgress(railProgress, 0.18, 0.38),
      };
    }
    if (railProgress < 0.48) {
      return { sourceFormation: "grid", targetFormation: "grid", progress: 1 };
    }
    if (railProgress < 0.62) {
      return {
        sourceFormation: "grid",
        targetFormation: "spheres",
        progress: remapProgress(railProgress, 0.48, 0.62),
      };
    }
    if (railProgress < 0.72) {
      return { sourceFormation: "spheres", targetFormation: "spheres", progress: 1 };
    }
    if (railProgress < 0.86) {
      return {
        sourceFormation: "spheres",
        targetFormation: "continents",
        progress: remapProgress(railProgress, 0.72, 0.86),
      };
    }
    if (railProgress < 0.92) {
      return { sourceFormation: "continents", targetFormation: "continents", progress: 1 };
    }
    return {
      sourceFormation: "continents",
      targetFormation: "rain",
      progress: remapProgress(railProgress, 0.92, 1),
    };
  }

  // Tree rail (beats 9–13): drive off the continuous railProgress so formation morphs
  // never reset to 0 at a beat boundary. Starts from "rain" to bridge seamlessly from
  // the world rail's final formation.
  if (beat.rail === "tree") {
    if (railProgress < 0.14) {
      return { sourceFormation: "rain",     targetFormation: "trunk",    progress: remapProgress(railProgress, 0,    0.14) };
    }
    if (railProgress < 0.22) {
      return { sourceFormation: "trunk",    targetFormation: "trunk",    progress: 1 };
    }
    if (railProgress < 0.42) {
      return { sourceFormation: "trunk",    targetFormation: "branches", progress: remapProgress(railProgress, 0.22, 0.42) };
    }
    if (railProgress < 0.54) {
      return { sourceFormation: "branches", targetFormation: "branches", progress: 1 };
    }
    if (railProgress < 0.66) {
      return { sourceFormation: "branches", targetFormation: "tree",     progress: remapProgress(railProgress, 0.54, 0.66) };
    }
    if (railProgress < 0.88) {
      return { sourceFormation: "tree",     targetFormation: "tree",     progress: 1 };
    }
    return   { sourceFormation: "tree",     targetFormation: "roots",    progress: remapProgress(railProgress, 0.88, 0.98) };
  }

  // Network rail (beats 14–17): same principle. Starts from "roots" to bridge from tree rail.
  if (railProgress < 0.14) {
    return { sourceFormation: "roots",  targetFormation: "tunnel", progress: remapProgress(railProgress, 0,    0.14) };
  }
  if (railProgress < 0.72) {
    return { sourceFormation: "tunnel", targetFormation: "tunnel", progress: 1 };
  }
  if (railProgress < 0.88) {
    return { sourceFormation: "tunnel", targetFormation: "city",   progress: remapProgress(railProgress, 0.72, 0.88) };
  }
  return   { sourceFormation: "city",   targetFormation: "city",   progress: 1 };
}

function updateCamera(
  beat: BeatConfig,
  progress: number,
  time: number,
  treeCenter: THREE.Vector3,
  treeMin: number,
  treeHeight: number,
  tunnelCenter: THREE.Vector3,
  tunnelLength: number,
  tunnelAxis: string,
  cityCenter: THREE.Vector3,
  citySize: THREE.Vector3
): { position: THREE.Vector3; lookAt: THREE.Vector3; fov: number } {
  const railProgress = THREE.MathUtils.clamp(
    THREE.MathUtils.lerp(beat.railStart, beat.railEnd, progress),
    0,
    1
  );
  const halfLen = tunnelLength * 0.45;
  const tunnelStart = new THREE.Vector3(
    tunnelAxis === "x" ? tunnelCenter.x - halfLen - 6 : tunnelCenter.x,
    tunnelAxis === "y" ? tunnelCenter.y - halfLen - 6 : tunnelCenter.y,
    tunnelAxis === "z" ? tunnelCenter.z - halfLen - 6 : tunnelCenter.z
  );
  const tunnelMid = new THREE.Vector3(
    tunnelAxis === "x" ? tunnelCenter.x - halfLen + tunnelLength * 0.42 : tunnelCenter.x,
    tunnelAxis === "y" ? tunnelCenter.y - halfLen + tunnelLength * 0.42 : tunnelCenter.y,
    tunnelAxis === "z" ? tunnelCenter.z - halfLen + tunnelLength * 0.42 : tunnelCenter.z
  );
  const tunnelEnd = new THREE.Vector3(
    tunnelAxis === "x" ? tunnelCenter.x - halfLen + tunnelLength * 0.94 : tunnelCenter.x,
    tunnelAxis === "y" ? tunnelCenter.y - halfLen + tunnelLength * 0.94 : tunnelCenter.y,
    tunnelAxis === "z" ? tunnelCenter.z - halfLen + tunnelLength * 0.94 : tunnelCenter.z
  );

  const worldPos = [
    new THREE.Vector3(1.5, 3.8, 42),
    new THREE.Vector3(0.8, 2.6, 30),
    new THREE.Vector3(0.2, 1.4, 18),
    new THREE.Vector3(0.8, 1.0, 10),
    new THREE.Vector3(2.8, 1.3, -2),
    new THREE.Vector3(5.5, 3.6, -7),
    new THREE.Vector3(7.5, 9.5, -2),
    new THREE.Vector3(6.2, 17.5, 4),
    new THREE.Vector3(2.8, 28.5, 2),
    new THREE.Vector3(-0.5, 35.5, 0),
    new THREE.Vector3(-0.4, 38.5, 0.5),
    new THREE.Vector3(-0.2, 22, 5),
    new THREE.Vector3(0, 14.5, 8),
    new THREE.Vector3(0, 8.8, 10),
    new THREE.Vector3(0, 2.4, 14),
  ];
  const worldLook = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.6, -2),
    new THREE.Vector3(0, -2.5, -12),
    new THREE.Vector3(0, -1.1, -17),
    new THREE.Vector3(0, 0.4, -12),
    new THREE.Vector3(0.4, 2.2, -4),
    new THREE.Vector3(0.8, 2.6, 0),
    new THREE.Vector3(0, 1.4, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.4, 0.2),
    new THREE.Vector3(0, -0.5, 0),
    new THREE.Vector3(0, -2.5, -3),
    new THREE.Vector3(0, -3.8, -5.5),
    new THREE.Vector3(0, -4.8, -8),
    new THREE.Vector3(0, -5.6, -14),
  ];

  const treePos = [
    new THREE.Vector3(0, 2.6, 12.5), // matches world-rail fall-curve endpoint → no Y snap
    new THREE.Vector3(0.8, treeMin + treeHeight * 0.18, 13.5),
    new THREE.Vector3(1.4, treeMin + treeHeight * 0.36, 12),
    new THREE.Vector3(7.5, treeMin + treeHeight * 0.48, 14.5),
    new THREE.Vector3(15.5, treeMin + treeHeight * 0.42, 10),
    new THREE.Vector3(17.5, treeMin + treeHeight * 0.36, 0),
    new THREE.Vector3(11, treeMin + treeHeight * 0.34, -12),
    new THREE.Vector3(0, treeMin + treeHeight * 0.32, -17.5),
    new THREE.Vector3(-12.5, treeMin + treeHeight * 0.32, -10.5),
    new THREE.Vector3(-18.5, treeMin + treeHeight * 0.3, 0),
    new THREE.Vector3(-12, treeMin + treeHeight * 0.28, 11.5),
    new THREE.Vector3(0, treeMin + treeHeight * 0.2, 14.5),
    new THREE.Vector3(0, treeMin + treeHeight * 0.05, 13),
    new THREE.Vector3(0, treeMin - 7.5, 10.5),
    new THREE.Vector3(0, treeMin - 16, 8.5),
  ];
  const treeLook = [
    new THREE.Vector3(0, treeMin + treeHeight * 0.26, 0),
    new THREE.Vector3(0, treeMin + treeHeight * 0.36, 0),
    new THREE.Vector3(0, treeMin + treeHeight * 0.44, 0),
    new THREE.Vector3(0, treeMin + treeHeight * 0.48, 0),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.42, treeCenter.z),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.37, treeCenter.z),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.36, treeCenter.z),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.35, treeCenter.z),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.34, treeCenter.z),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.32, treeCenter.z),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.28, treeCenter.z),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.18, treeCenter.z),
    new THREE.Vector3(treeCenter.x, treeMin + treeHeight * 0.08, treeCenter.z),
    new THREE.Vector3(0, treeMin - 2, 0),
    new THREE.Vector3(0, treeMin - 5.5, 0),
  ];

  const networkPos = [
    new THREE.Vector3(0, treeMin - 14, 9), // matches tree-rail rootsDrop endpoint → no Y snap
    tunnelStart.clone().add(
      new THREE.Vector3(
        tunnelAxis === "x" ? -3 : 0,
        tunnelAxis === "y" ? -3 : 0,
        tunnelAxis === "z" ? 4 : 0
      )
    ),
    tunnelStart.clone(),
    tunnelMid.clone(),
    tunnelEnd.clone(),
    tunnelEnd.clone().add(
      new THREE.Vector3(
        tunnelAxis === "x" ? 8 : 0,
        tunnelAxis === "y" ? 8 : 0,
        tunnelAxis === "z" ? -10 : 0
      )
    ),
    new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.7, cityCenter.z + 18),
    new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.55, cityCenter.z + 32),
    new THREE.Vector3(cityCenter.x + 6, cityCenter.y + citySize.y * 0.18, cityCenter.z + 12),
    new THREE.Vector3(cityCenter.x + 2, cityCenter.y + citySize.y * 0.14, cityCenter.z + 4),
  ];
  const networkLook = [
    new THREE.Vector3(0, treeMin - 4, 0),
    tunnelStart.clone().add(
      new THREE.Vector3(
        tunnelAxis === "x" ? 8 : 0,
        tunnelAxis === "y" ? 8 : 0,
        tunnelAxis === "z" ? -8 : 0
      )
    ),
    tunnelMid.clone(),
    tunnelEnd.clone(),
    new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.24, cityCenter.z + 5),
    new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.15, cityCenter.z),
    new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.12, cityCenter.z),
    new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.08, cityCenter.z),
    new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.12, cityCenter.z - 3),
    new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.15, cityCenter.z - 6),
  ];

  let position: THREE.Vector3;
  let lookAt: THREE.Vector3;

  if (beat.rail === "world") {
    position = sampleCurve(worldPos, railProgress);
    lookAt = sampleCurve(worldLook, railProgress);
  } else if (beat.rail === "tree") {
    position = sampleCurve(treePos, railProgress);
    lookAt = sampleCurve(treeLook, railProgress);
  } else {
    position = sampleCurve(networkPos, railProgress);
    lookAt = sampleCurve(networkLook, railProgress);
  }

  if (beat.rail === "world" && railProgress >= 0.1 && railProgress <= 0.38) {
    const intro = remapProgress(railProgress, 0.1, 0.38);
    const introPosition = sampleCurve(
      [
        new THREE.Vector3(0.4, 1.8, 21),
        new THREE.Vector3(0.15, 1.0, 10),
        new THREE.Vector3(0.7, 1.05, 3),
        new THREE.Vector3(2.6, 1.8, -2.5),
      ],
      intro
    );
    const introLook = sampleCurve(
      [
        new THREE.Vector3(0, -0.8, -6),
        new THREE.Vector3(0, -1.2, -16),
        new THREE.Vector3(0.15, -0.2, -12),
        new THREE.Vector3(0.4, 0.4, -8),
      ],
      intro
    );
    position.lerp(introPosition, 0.84);
    lookAt.lerp(introLook, 0.86);
  } else if (beat.rail === "world" && railProgress > 0.38 && railProgress <= 0.84) {
    const rise = remapProgress(railProgress, 0.38, 0.84);
    const risePosition = sampleCurve(
      [
        new THREE.Vector3(2.6, 1.8, -2.5),
        new THREE.Vector3(6.8, 9.5, 5.5),
        new THREE.Vector3(2.5, 24, 2.5),
        new THREE.Vector3(-0.3, 35.5, 0.2),
      ],
      rise
    );
    const riseLook = sampleCurve(
      [
        new THREE.Vector3(0.4, 0.4, -8),
        new THREE.Vector3(0.8, 1.8, -1.5),
        new THREE.Vector3(0.2, 0.2, 0),
        new THREE.Vector3(0, -0.4, 0.2),
      ],
      rise
    );
    position.lerp(risePosition, 0.86);
    lookAt.lerp(riseLook, 0.88);
  } else if (beat.rail === "world" && railProgress > 0.84) {
    const fall = remapProgress(railProgress, 0.84, 1);
    const fallPosition = sampleCurve(
      [
        new THREE.Vector3(-0.3, 35.5, 0.2),
        new THREE.Vector3(0, 22, 5),
        new THREE.Vector3(0, 10.5, 8.5),
        new THREE.Vector3(0, 2.6, 12.5),
      ],
      fall
    );
    const fallLook = sampleCurve(
      [
        new THREE.Vector3(0, -0.4, 0.2),
        new THREE.Vector3(0, -0.5, 0),
        new THREE.Vector3(0, -2.5, -3),
        new THREE.Vector3(0, -5.4, -12.5),
      ],
      fall
    );
    position.lerp(fallPosition, 0.9);
    lookAt.lerp(fallLook, 0.9);
  } else if (beat.rail === "network" && railProgress <= 0.68) {
    const travel = remapProgress(railProgress, 0, 0.68, (value) => value);
    const travelPosition = sampleCurve(
      [
        new THREE.Vector3(0, treeMin - 14, 9),
        tunnelStart.clone().add(
          new THREE.Vector3(
            tunnelAxis === "x" ? -4 : 0,
            tunnelAxis === "y" ? -4 : 0,
            tunnelAxis === "z" ? 7 : 0
          )
        ),
        tunnelStart.clone(),
        tunnelMid.clone(),
        tunnelEnd.clone(),
      ],
      travel
    );
    const travelLook = sampleCurve(
      [
        new THREE.Vector3(0, treeMin - 4, 0),
        tunnelStart.clone().add(
          new THREE.Vector3(
            tunnelAxis === "x" ? 8 : 0,
            tunnelAxis === "y" ? 8 : 0,
            tunnelAxis === "z" ? -8 : 0
          )
        ),
        tunnelMid.clone(),
        tunnelEnd.clone(),
        tunnelEnd
          .clone()
          .add(
            new THREE.Vector3(
              tunnelAxis === "x" ? 14 : 0,
              tunnelAxis === "y" ? 14 : 0,
              tunnelAxis === "z" ? -14 : 0
            )
          ),
      ],
      THREE.MathUtils.clamp(travel + 0.1, 0, 1)
    );
    position.lerp(travelPosition, 0.86);
    lookAt.lerp(travelLook, 0.88);
  } else if (beat.rail === "network" && railProgress > 0.68) {
    const city = remapProgress(railProgress, 0.68, 1);
    const cityPosition = sampleCurve(
      [
        tunnelEnd.clone().add(
          new THREE.Vector3(
            tunnelAxis === "x" ? 8 : 0,
            tunnelAxis === "y" ? 8 : 0,
            tunnelAxis === "z" ? -10 : 0
          )
        ),
        new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.72, cityCenter.z + 24),
        new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.55, cityCenter.z + 22),
        new THREE.Vector3(cityCenter.x + 2, cityCenter.y + citySize.y * 0.14, cityCenter.z + 4),
      ],
      city
    );
    const cityLook = sampleCurve(
      [
        new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.24, cityCenter.z + 5),
        new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.15, cityCenter.z),
        new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.12, cityCenter.z - 3),
        new THREE.Vector3(cityCenter.x, cityCenter.y + citySize.y * 0.15, cityCenter.z - 6),
      ],
      city
    );
    position.lerp(cityPosition, 0.88);
    lookAt.lerp(cityLook, 0.9);
  }

  if (beat.cameraMode === "treeOrbit") {
    // Start angle ≈ -2.4 rad matches the tree-rail spline direction at beat-12 entry
    // so the orbit circle begins where the camera actually is, not at an arbitrary angle=0.
    const ORBIT_START = -2.4;
    const orbitAngle = ORBIT_START + smoothStep(progress) * Math.PI * 2;
    const radius = 22;
    const orbitPosition = new THREE.Vector3(
      Math.sin(orbitAngle) * radius,
      treeMin + treeHeight * 0.32,
      Math.cos(orbitAngle) * radius
    );
    const orbitLook = new THREE.Vector3(
      treeCenter.x,
      treeMin + treeHeight * 0.35,
      treeCenter.z
    );
    // Ramp blend from 0→0.78 over the first 20 % of the beat so the camera
    // glides into orbit rather than snapping to the orbit circle on frame 1.
    const introBlend = smoothStep(Math.min(progress / 0.2, 1));
    position.lerp(orbitPosition, introBlend * 0.78);
    lookAt.lerp(orbitLook, introBlend * 0.78);
  } else if (beat.cameraMode === "branchesOrbit") {
    const orbitAngle = smoothStep(progress) * Math.PI * 1.2 - Math.PI * 0.25;
    const orbitPosition = new THREE.Vector3(
      Math.sin(orbitAngle) * 18,
      treeMin + treeHeight * 0.46,
      Math.cos(orbitAngle) * 18
    );
    const orbitLook = new THREE.Vector3(0, treeMin + treeHeight * 0.42, 0);
    const introBlend = smoothStep(Math.min(progress / 0.25, 1));
    const blend = introBlend * (0.48 + smoothStep(progress) * 0.24);
    position.lerp(orbitPosition, blend);
    lookAt.lerp(orbitLook, blend);
  } else if (beat.cameraMode === "rootsDrop") {
    const dropPhase = smoothStep(progress);
    const rootsPosition = new THREE.Vector3(
      0,
      treeMin - 6 - dropPhase * 10,
      10.5 - dropPhase * 2.5
    );
    const rootsLook = new THREE.Vector3(
      0,
      treeMin - 1.5 - dropPhase * 4,
      0
    );
    const introBlend = smoothStep(Math.min(progress / 0.2, 1));
    const blend = introBlend * (0.55 + dropPhase * 0.25);
    position.lerp(rootsPosition, blend);
    lookAt.lerp(rootsLook, blend);
  }

  position.x += Math.sin(time * 0.04) * 0.45;
  position.y += Math.sin(time * 0.025) * 0.2;
  lookAt.x += Math.sin(time * 0.03) * 0.18;

  let fov = beat.rail === "network" ? 58 : beat.rail === "world" ? 61 : 60;
  if (beat.cameraMode === "planetDive" || beat.cameraMode === "tunnelTravel") {
    fov = 68;
  } else if (beat.cameraMode === "continentsArrival") {
    fov = 54;
  } else if (beat.cameraMode === "cityArrival") {
    fov = 48;
  } else if (beat.cameraMode === "treeOrbit") {
    fov = 57;
  } else if (beat.cameraMode === "continentsCollapse") {
    fov = 64;
  } else if (beat.cameraMode === "cityBurst") {
    fov = 62;
  }
  return { position, lookAt, fov };
}

export default ParticleScene;
