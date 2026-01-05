import SceneCanvas from "@/components/SceneCanvas";
import * as THREE from "three";
import PlaneStencilGroup from "./PlaneStencilGroup";
import { useRef } from "react";
import { useControls } from "leva";
import { useFrame } from "@react-three/fiber";

const Scene = () => {
  const clipPlane = useRef(
    new THREE.Plane(new THREE.Vector3(-1, -1, -1).normalize(), 0)
  );
  const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);

  const { x, y, z, constant } = useControls({
    x: { value: -1, min: -1, max: 1 },
    y: { value: -1, min: -1, max: 1 },
    z: { value: -1, min: -1, max: 1 },
    constant: { value: 0, min: -1, max: 1 },
  });

  useFrame(() => {
    clipPlane.current.normal.set(x, y, z).normalize();
    clipPlane.current.constant = constant;
  });

  const planeColor = new THREE.Color();
  planeColor.r = (x + 1) / 2;
  planeColor.g = (y + 1) / 2;
  planeColor.b = (z + 1) / 2;

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
      <PlaneStencilGroup
        geometry={geometry}
        plane={clipPlane.current}
        color={planeColor}
      />
    </>
  );
};

const stencilClip = () => {
  return (
    <SceneCanvas
      gl={{ stencil: true, localClippingEnabled: true }}
      camera={{ position: [0, 0, 4] }}
    >
      <Scene />
    </SceneCanvas>
  );
};

export default stencilClip;
