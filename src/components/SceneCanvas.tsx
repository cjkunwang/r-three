import React, { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

type Props = {
  children: ReactNode;
  camera?: { position?: [number, number, number]; fov?: number };
  lights?: boolean;
  className?: string;
  isOrbitControls?: boolean;
  gl?: { localClippingEnabled?: boolean; stencil?: boolean };
};

export default function SceneCanvas({
  children,
  camera,
  lights = true,
  className,
  isOrbitControls = true,
  gl = { localClippingEnabled: false, stencil: false },
}: Props) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{
          position: camera?.position ?? [3, 3, 3],
          fov: camera?.fov ?? 60,
        }}
        gl={gl}
      >
        {lights && (
          <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.9} />
          </>
        )}
        {children}
        {isOrbitControls && <OrbitControls />}
      </Canvas>
    </div>
  );
}
