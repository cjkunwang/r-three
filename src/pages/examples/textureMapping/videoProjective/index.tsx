import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import createProjectionMaterial from "../utils/createProjectionMaterial";

const VideoProjective = () => {
  const [videoTexture, setVideoTexture] = useState<THREE.Texture | null>(null);
  const projector = useMemo(() => {
    const projectiveCamera = new THREE.PerspectiveCamera(45, 16 / 9, 1, 100);
    projectiveCamera.position.set(0, 0, 100);
    projectiveCamera.lookAt(0, 0, 0);
    return projectiveCamera;
  }, []);

  const projectionMaterial = useMemo(() => {
    if (!videoTexture) return null;
    return createProjectionMaterial(videoTexture, projector);
  }, [videoTexture, projector]);

  useFrame(() => {
    if (!projectionMaterial || !projector) return;
    const uniforms = projectionMaterial.uniforms as any;
    if (uniforms.projectorViewProjectionMatrix) {
      uniforms.projectorViewProjectionMatrix.value
        .copy(projector.projectionMatrix)
        .multiply(projector.matrixWorldInverse);
    }
    if (uniforms.projectorPosition) {
      uniforms.projectorPosition.value.copy(projector.position);
    }
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }
  });

  //source 1
  //   useEffect(() => {
  //     const video = document.createElement("video");
  //     video.src = "/textures/tears_of_steel_bridge_2k.mp4";
  //     video.loop = true;
  //     video.muted = true; // 自动播放需要静音
  //     video.crossOrigin = "anonymous";
  //     video.playsInline = true; // 移动端需要
  //     video.preload = "auto";
  //     video.addEventListener("loadedmetadata", () => {
  //       video.play().catch((e) => console.log("自动播放被阻止:", e));
  //     });
  //     const texture = new THREE.VideoTexture(video);
  //     texture.minFilter = THREE.LinearFilter;
  //     texture.magFilter = THREE.LinearFilter;
  //     texture.format = THREE.RGBFormat;
  //     setVideoTexture(texture);
  //   }, []);

  async function createCameraTexture() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      return new THREE.VideoTexture(video);
    } catch (err) {
      console.error("无法访问摄像头:", err);
      return null;
    }
  }

  useEffect(() => {
    createCameraTexture().then((texture) => {
      if (texture) {
        setVideoTexture(texture);
      }
    });
  }, []);

  return (
    <>
      <cameraHelper args={[projector]} />
      <mesh>
        <planeGeometry args={[160, 90]} />
        {projectionMaterial && (
          <primitive object={projectionMaterial} attach="material" />
        )}
      </mesh>
      <mesh>
        <boxGeometry args={[3, 3, 3]} />
        {projectionMaterial && (
          <primitive object={projectionMaterial} attach="material" />
        )}
      </mesh>
    </>
  );
};

export default function VideoScene() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 60,
        }}
      >
        <color attach="background" args={["#222222"]} />
        <VideoProjective />
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <directionalLight intensity={0.7} />
      </Canvas>
    </div>
  );
}
