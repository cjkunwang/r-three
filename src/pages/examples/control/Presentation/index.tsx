import React from "react";
import SceneCanvas from "@/components/SceneCanvas";
import BoxScene from "@/scenes/basic/BoxScene";
import PresentationControls from "@/components/PresentationControls";

export default function TorusPage() {
  return (
    <SceneCanvas
      camera={{ position: [3, 2.5, 3], fov: 60 }}
      isOrbitControls={false}
    >
      <PresentationControls
        speed={1}
        snap={false}
        polar={[0, Math.PI]}
        azimuth={[-Math.PI / 2, Math.PI / 2]}
        eps={0.01}
      >
        <BoxScene isAnimated={false} />
      </PresentationControls>
    </SceneCanvas>
  );
}
