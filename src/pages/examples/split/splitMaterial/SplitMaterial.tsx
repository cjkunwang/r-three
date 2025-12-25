import { ReactNode, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Color, PerspectiveCamera, Scene } from "three";
import Environment from "./Environment";

export default function SplitMaterial({
  left,
  right,
  split,
}: {
  left: ReactNode;
  right: ReactNode;
  split: number;
}) {
  const camL = useRef<PerspectiveCamera>(null);
  const camR = useRef<PerspectiveCamera>(null);
  const { camera, size } = useThree();

  const sceneL = useMemo(() => {
    const s = new Scene();
    s.background = new Color("#222");
    return s;
  }, []);

  const sceneR = useMemo(() => {
    const s = new Scene();
    s.background = new Color("#eee");
    return s;
  }, []);

  useFrame(({ gl }) => {
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

    const oldAutoClear = gl.autoClear;
    gl.autoClear = false;
    if (oldAutoClear) gl.clear();

    const splitX = size.width * split;

    gl.setScissorTest(true);
    gl.setScissor(0, 0, splitX, size.height);
    gl.setViewport(0, 0, size.width, size.height);
    if (camL.current) {
      camL.current.aspect = size.width / size.height;
      camL.current.updateProjectionMatrix();
      gl.render(sceneL, camL.current);
    }

    gl.setScissor(splitX, 0, size.width - splitX, size.height);
    gl.setViewport(0, 0, size.width, size.height);
    gl.clearDepth();
    if (camR.current) {
      camR.current.aspect = size.width / size.height;
      camR.current.updateProjectionMatrix();
      gl.render(sceneR, camR.current);
    }

    gl.setScissorTest(false);
    gl.autoClear = oldAutoClear;
  }, 1);

  return (
    <>
      {createPortal(
        <>
          <perspectiveCamera ref={camL} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {left}
        </>,
        sceneL
      )}
      {createPortal(
        <>
          <perspectiveCamera ref={camR} />
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <Environment />
          {right}
        </>,
        sceneR
      )}
    </>
  );
}
