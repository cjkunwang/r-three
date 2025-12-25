import { useState } from "react";
import SceneCanvas from "@/components/SceneCanvas";
import ExampleLayout from "@/components/ExampleLayout";
import readme from "./README.md?raw";
import SplitMaterial from "./SplitMaterial";
import SceneContent from "./SceneContent";
import Slider from "./Slider";

export default function SplitMaterialScene() {
  const [split, setSplit] = useState(0.5);

  return (
    <ExampleLayout
      canvas={
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <SceneCanvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <SplitMaterial
              split={split}
              left={<SceneContent materialType="basic" />}
              right={<SceneContent materialType="advanced" />}
            />
          </SceneCanvas>
          <Slider value={split} onChange={setSplit} />
        </div>
      }
      source={readme}
    />
  );
}
