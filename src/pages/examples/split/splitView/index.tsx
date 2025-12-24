import { ReactNode, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import SceneCanvas from "@/components/SceneCanvas";
import BoxScene from "@/scenes/basic/BoxScene";
import ExampleLayout from "@/components/ExampleLayout";
import readme from "./README.md?raw";

function SplitView({ children }: { children?: ReactNode }) {
  const camL = useRef<PerspectiveCamera>(null);
  const camR = useRef<PerspectiveCamera>(null);
  const { scene, camera } = useThree();

  useFrame(({ gl, size }) => {
    /* 1. 准备相机 */
    if (camL.current) {
      camL.current.position.copy(camera.position);
      camL.current.quaternion.copy(camera.quaternion);
      camL.current.translateX(-0.3);
      camL.current.updateMatrixWorld();
    }

    if (camR.current) {
      camR.current.position.copy(camera.position);
      camR.current.quaternion.copy(camera.quaternion);
      camR.current.translateX(0.3);
      camR.current.updateMatrixWorld();
    }

    /* 2. 关闭自动清屏，避免默认渲染冲掉我们画的内容 */
    const oldAutoClear = gl.autoClear;
    gl.autoClear = false;
    if (oldAutoClear) gl.clear();

    /* 3. 左半屏 */
    gl.setScissorTest(true);
    gl.setScissor(0, 0, size.width / 2, size.height);
    gl.setViewport(0, 0, size.width / 2, size.height);
    if (camL.current) {
      camL.current.aspect = size.width / 2 / size.height;
      camL.current.updateProjectionMatrix();
      gl.render(scene, camL.current);
    }

    /* 4. 右半屏 */
    gl.setScissor(size.width / 2, 0, size.width / 2, size.height);
    gl.setViewport(size.width / 2, 0, size.width / 2, size.height);
    gl.clearDepth();
    if (camR.current) {
      camR.current.aspect = size.width / 2 / size.height;
      camR.current.updateProjectionMatrix();
      gl.render(scene, camR.current);
    }

    /* 5. 恢复默认状态 */
    gl.setScissorTest(false);
    gl.autoClear = oldAutoClear;
  }, 1); // 优先级>0，确保在 R3F 默认渲染之后执行

  return (
    <>
      <perspectiveCamera ref={camL} />
      <perspectiveCamera ref={camR} />
      {children}
    </>
  );
}

export default function SplitViewScene() {
  return (
    <ExampleLayout
      canvas={
        <SceneCanvas
          camera={{ position: [3, 2.5, 3], fov: 60 }}
          isOrbitControls={false}
        >
          <SplitView>
            <BoxScene />
          </SplitView>
        </SceneCanvas>
      }
      source={readme}
    />
  );
}
