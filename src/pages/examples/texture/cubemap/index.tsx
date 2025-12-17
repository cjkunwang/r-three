import React from "react";
import SceneCanvas from "@/components/SceneCanvas";
import BoxScene from "@/scenes/basic/BoxScene";
import { useLoader } from "@react-three/fiber";
import { CubeTextureLoader } from "three";

export default function TorusPage() {
  const [cubeTexture] = useLoader(CubeTextureLoader, [
    [
      "/textures/skybox/px.jpg",
      "/textures/skybox/nx.jpg",
      "/textures/skybox/py.jpg",
      "/textures/skybox/ny.jpg",
      "/textures/skybox/pz.jpg",
      "/textures/skybox/nz.jpg",
    ],
  ]);

  return (
    <SceneCanvas camera={{ position: [3, 2.5, 3], fov: 60 }}>
      <primitive object={cubeTexture} attach="background" />
      <BoxScene />
    </SceneCanvas>
  );
}
