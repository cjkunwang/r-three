import SceneCanvas from "@/components/SceneCanvas";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from "@react-three/drei";
import { PMREMGenerator, TextureLoader } from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const PeopleScene = () => {
  const { gl } = useThree();
  const clock = useThree((state) => state.clock);

  // 改用这种方式：
  const [envMapTexture, setEnvMapTexture] =
    React.useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.load("/textures/envmap.jpg", (texture) => {
      const pmrem = new PMREMGenerator(gl);
      pmrem.compileEquirectangularShader();
      const renderTarget = pmrem.fromEquirectangular(texture);
      setEnvMapTexture(renderTarget.texture);
      texture.dispose();
      pmrem.dispose();
    });
  }, [gl]);

  useFrame(() => {
    // 模型旋转
    const elapsedTime = clock.getElapsedTime();
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.envMapRotation.y = elapsedTime * 0.5;
            }
          });
        } else {
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.envMapRotation.y = elapsedTime * 0.5;
          }
        }
      }
    });
  });

  const obj = useLoader(OBJLoader, "/obj/people.obj");

  // 遍历模型并应用材质
  useMemo(() => {
    //obj 模型遍历
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 1,
          roughness: 0.05,
          envMap: envMapTexture,
          envMapIntensity: 2,
          toneMapped: false,
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [obj, envMapTexture]);

  return <primitive object={obj} />;
};

export default function People() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 30, 20], fov: 75 }}>
        <color attach="background" args={["#111"]} />
        <PeopleScene />
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <EffectComposer>
          <Bloom
            luminanceThreshold={1}
            mipmapBlur
            intensity={2.0}
            radius={0.4}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
