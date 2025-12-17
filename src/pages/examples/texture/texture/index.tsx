import React from "react";
import SceneCanvas from "@/components/SceneCanvas";
import BoxScene from "@/scenes/basic/BoxScene";
import { useLoader } from "@react-three/fiber";
import { EquirectangularReflectionMapping, TextureLoader } from "three";

export default function TorusPage() {
  const texture = useLoader(
    TextureLoader,
    "/textures/tears_of_steel_bridge_2k.jpg"
  );
  texture.mapping = EquirectangularReflectionMapping;

  return (
    <SceneCanvas camera={{ position: [3, 2.5, 3], fov: 60 }}>
      <primitive object={texture} attach="background" />
      {/* <primitive object={texture} attach="environment" /> */}
      <BoxScene />
    </SceneCanvas>
  );
}
