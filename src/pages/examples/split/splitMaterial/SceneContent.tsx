import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function SceneContent({
  materialType,
}: {
  materialType: "basic" | "advanced";
}) {
  const meshRef = useRef<any>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      {materialType === "basic" ? (
        <meshStandardMaterial
          color="#ff6b6b"
          roughness={0.8}
          wireframe={true}
        />
      ) : (
        <meshPhysicalMaterial
          color="#4ecdc4"
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      )}
    </mesh>
  );
}
