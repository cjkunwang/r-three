import SceneCanvas from "@/components/SceneCanvas";
import * as THREE from "three";

import { useMemo, useRef } from "react";
import { useControls } from "leva";
import { useFrame } from "@react-three/fiber";

import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from "three-mesh-bvh";
import { Section } from "./Section";

// @ts-ignore
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
// @ts-ignore
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const Scene = () => {
  const clipPlane = useRef(
    new THREE.Plane(new THREE.Vector3(-1, -1, -1).normalize(), 0)
  );

  const geometry = useMemo(() => {
    const geo = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
    // @ts-ignore
    geo.computeBoundsTree();
    return geo;
  }, []);

  const { x, y, z, constant } = useControls({
    x: { value: -1, min: -1, max: 1 },
    y: { value: -1, min: -1, max: 1 },
    z: { value: -1, min: -1, max: 1 },
    constant: { value: 0, min: -1, max: 1 },
  });

  const planeColor = new THREE.Color();
  planeColor.r = (x + 1) / 2;
  planeColor.g = (y + 1) / 2;
  planeColor.b = (z + 1) / 2;

  const helperRef = useRef<THREE.ArrowHelper>(null);

  useFrame(() => {
    clipPlane.current.normal.set(x, y, z).normalize();
    clipPlane.current.constant = constant;

    if (helperRef.current) {
      helperRef.current.setDirection(clipPlane.current.normal);
      helperRef.current.position
        .copy(clipPlane.current.normal)
        .multiplyScalar(-constant);
      helperRef.current.position.add(
        clipPlane.current.normal.clone().multiplyScalar(0.1)
      ); // slightly offset to see
    }
  });

  return (
    <>
      <mesh>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial
          color="#ff6b6b"
          roughness={0.8}
          side={THREE.DoubleSide}
          clippingPlanes={[clipPlane.current]}
          clipShadows={true}
        />
      </mesh>
      <Section
        geometry={geometry}
        plane={clipPlane.current}
        color={planeColor}
      />
    </>
  );
};

const BVHCliping = () => {
  return (
    <SceneCanvas
      gl={{ stencil: true, localClippingEnabled: true }}
      camera={{ position: [0, 0, 4] }}
    >
      <Scene />
    </SceneCanvas>
  );
};

export default BVHCliping;
