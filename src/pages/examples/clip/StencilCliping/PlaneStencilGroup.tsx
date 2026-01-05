import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface PlaneStencilGroupProps {
  geometry: THREE.BufferGeometry;
  plane: THREE.Plane;
  color: THREE.Color;
}

const PlaneStencilGroup = ({
  geometry,
  plane,
  color,
}: PlaneStencilGroupProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const n = plane.normal;
      const constant = plane.constant;
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        n
      );
      meshRef.current.quaternion.copy(q);
      meshRef.current.position.copy(n).multiplyScalar(-constant);
    }
  });

  return (
    <group>
      <mesh geometry={geometry} renderOrder={1}>
        <meshBasicMaterial
          side={THREE.FrontSide}
          clippingPlanes={[plane]}
          colorWrite={false}
          depthTest={false}
          depthWrite={false}
          stencilWrite={true}
          stencilRef={1}
          stencilFunc={THREE.AlwaysStencilFunc}
          stencilZFail={THREE.KeepStencilOp}
          stencilZPass={THREE.DecrementWrapStencilOp}
          stencilFail={THREE.KeepStencilOp}
        />
      </mesh>
      <mesh geometry={geometry} renderOrder={1}>
        <meshBasicMaterial
          side={THREE.BackSide}
          clippingPlanes={[plane]}
          colorWrite={false}
          depthTest={false}
          depthWrite={false}
          stencilWrite={true}
          stencilRef={1}
          stencilFunc={THREE.AlwaysStencilFunc}
          stencilZFail={THREE.KeepStencilOp}
          stencilZPass={THREE.IncrementWrapStencilOp}
          stencilFail={THREE.KeepStencilOp}
        />
      </mesh>
      {/* 2. 剖面填充：只画模板值 != 0 的区域 ************/}
      <mesh ref={meshRef} renderOrder={2}>
        <planeGeometry args={[10, 10]} /> {/* 足够大即可 */}
        <meshBasicMaterial
          color={color}
          depthWrite={false}
          stencilWrite={true}
          stencilRef={0}
          stencilFunc={THREE.NotEqualStencilFunc}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default PlaneStencilGroup;
