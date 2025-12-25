import SceneCanvas from "@/components/SceneCanvas";
import { useFrame } from "@react-three/fiber";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useControls } from "leva";

function Scene() {
  const clipPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 0), 0.8));
  const planeRef = useRef<THREE.Mesh>(null);
  const planeMatRef = useRef<THREE.ShaderMaterial>(null);

  const { x, y, z, constant, bandWidth } = useControls({
    x: { value: 0, min: -1, max: 1, step: 0.1 },
    y: { value: -1, min: -1, max: 1, step: 0.1 },
    z: { value: 0, min: -1, max: 1, step: 0.1 },
    constant: {
      value: 0.8,
      min: -1,
      max: 1,
      step: 0.1,
    },
    bandWidth: { value: 0.03, min: 0.0, max: 0.2, step: 0.005 },
  });

  useFrame(() => {
    clipPlane.current.normal.set(x, y, z).normalize();
    clipPlane.current.constant = constant;
    if (planeMatRef.current) {
      planeMatRef.current.uniforms.bandWidth.value = bandWidth;
    }
    if (planeRef.current) {
      const n = clipPlane.current.normal;
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        n
      );
      planeRef.current.quaternion.copy(q);
      planeRef.current.position
        .copy(n)
        .multiplyScalar(-clipPlane.current.constant);
    }
  });

  const planeVertex = `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vLocalPos;
    void main() {
      vUv = uv;
      vLocalPos = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const planeFragment = `
    uniform vec3 color;
    uniform vec3 lineColor;
    uniform float bandWidth;
    uniform float gridScale;
    varying vec2 vUv;
    varying vec3 vLocalPos;
    void main() {
      vec3 base = color;
      vec2 g = abs(fract(vUv * gridScale) - 0.5);
      float lineG = smoothstep(0.48, 0.5, max(g.x, g.y));
      vec3 mixed = mix(base, lineColor, lineG);
      float center = 1.0 - smoothstep(0.0, bandWidth, abs(vLocalPos.y));
      mixed = mix(mixed, lineColor, center);
      gl_FragColor = vec4(mixed, 0.85);
    }
  `;

  return (
    <>
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial
          color="#ff6b6b"
          roughness={0.8}
          side={THREE.DoubleSide}
          clippingPlanes={[clipPlane.current]}
          clipShadows={true}
        />
      </mesh>
      <mesh ref={planeRef}>
        <planeGeometry args={[4, 4]} />
        <shaderMaterial
          ref={planeMatRef}
          vertexShader={planeVertex}
          fragmentShader={planeFragment}
          uniforms={{
            color: { value: new THREE.Color("#4ecdc4") },
            lineColor: { value: new THREE.Color("#00ff88") },
            bandWidth: { value: bandWidth },
            gridScale: { value: 10 },
          }}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
    </>
  );
}

export default function ClippingPlanes() {
  return (
    <SceneCanvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ localClippingEnabled: true }}
    >
      <Scene />
    </SceneCanvas>
  );
}
