import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

export default function BoxScene() {
  const ref = useRef<Mesh>(null);
  useFrame((_state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta;
    ref.current.rotation.y += delta * 0.8;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4f46e5" />
    </mesh>
  );
}
