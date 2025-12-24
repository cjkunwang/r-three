import { ReactNode, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Color, PerspectiveCamera, Scene } from "three";
import SceneCanvas from "@/components/SceneCanvas";
import BoxScene from "@/scenes/basic/BoxScene";
import TorusScene from "@/scenes/materials/TorusScene";
import ExampleLayout from "@/components/ExampleLayout";
import readme from "./README.md?raw";

function SplitView({ left, right }: { left: ReactNode; right: ReactNode }) {
  const camL = useRef<PerspectiveCamera>(null);
  const camR = useRef<PerspectiveCamera>(null);
  const { camera, size } = useThree();

  // 创建两个独立的场景
  const sceneL = useMemo(() => {
    const s = new Scene();
    s.background = new Color("#f0f0f0");
    return s;
  }, []);

  const sceneR = useMemo(() => {
    const s = new Scene();
    s.background = new Color("#d0d0d0");
    return s;
  }, []);

  useFrame(({ gl }) => {
    /* 1. 同步相机：将主相机的姿态复制给左右眼相机 (无偏移，完全一致) */
    if (camL.current) {
      camL.current.position.copy(camera.position);
      camL.current.quaternion.copy(camera.quaternion);
      camL.current.updateMatrixWorld();
    }

    if (camR.current) {
      camR.current.position.copy(camera.position);
      camR.current.quaternion.copy(camera.quaternion);
      camR.current.updateMatrixWorld();
    }

    /* 2. 关闭自动清屏，避免默认渲染冲掉我们画的内容 */
    const oldAutoClear = gl.autoClear;
    gl.autoClear = false;
    if (oldAutoClear) gl.clear();

    /* 3. 左半屏渲染 SceneL */
    gl.setScissorTest(true);
    gl.setScissor(0, 0, size.width / 2, size.height);
    gl.setViewport(0, 0, size.width / 2, size.height);
    if (camL.current) {
      camL.current.aspect = size.width / 2 / size.height;
      camL.current.updateProjectionMatrix();
      gl.render(sceneL, camL.current);
    }

    /* 4. 右半屏渲染 SceneR */
    gl.setScissor(size.width / 2, 0, size.width / 2, size.height);
    gl.setViewport(size.width / 2, 0, size.width / 2, size.height);
    gl.clearDepth();
    if (camR.current) {
      camR.current.aspect = size.width / 2 / size.height;
      camR.current.updateProjectionMatrix();
      gl.render(sceneR, camR.current);
    }

    /* 5. 恢复默认状态 */
    gl.setScissorTest(false);
    gl.autoClear = oldAutoClear;
  }, 1); // 优先级>0，确保在 R3F 默认渲染之后执行

  return (
    <>
      {createPortal(
        <>
          <perspectiveCamera ref={camL} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {left}
        </>,
        sceneL
      )}
      {createPortal(
        <>
          <perspectiveCamera ref={camR} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {right}
        </>,
        sceneR
      )}
    </>
  );
}

export default function SplitViewScene() {
  return (
    <ExampleLayout
      canvas={
        <SceneCanvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <SplitView left={<BoxScene />} right={<TorusScene />} />
        </SceneCanvas>
      }
      source={readme}
    />
  );
}
