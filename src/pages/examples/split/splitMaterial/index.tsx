import { ReactNode, useMemo, useRef, useState, useEffect } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Color, PerspectiveCamera, Scene } from "three";
import SceneCanvas from "@/components/SceneCanvas";
import ExampleLayout from "@/components/ExampleLayout";
import readme from "./README.md?raw";

// 定义一个简单的 Slider 组件
function Slider({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !trackRef.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      onChange(percentage);
    };

    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [onChange]);

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    document.body.style.cursor = "ew-resize";
    // 立即更新一次位置
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      onChange(x / rect.width);
    }
  };

  return (
    <div
      ref={trackRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        cursor: "ew-resize",
        pointerEvents: "none", // 让事件穿透到底下的 canvas
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${value * 100}%`,
          top: 0,
          bottom: 0,
          width: "4px",
          background: "white",
          transform: "translateX(-50%)",
          pointerEvents: "auto", // 只有分割线响应事件
          cursor: "ew-resize",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        }}
        onMouseDown={onDown}
        onTouchStart={onDown}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "32px",
            height: "32px",
            background: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
            <path
              d="M9 18l6-6-6-6"
              transform="rotate(180 12 12) translate(6 0)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SplitMaterial({
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
    /* 1. 同步相机 */
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

    /* 2. 关闭自动清屏 */
    const oldAutoClear = gl.autoClear;
    gl.autoClear = false;
    if (oldAutoClear) gl.clear();

    const splitX = size.width * split;

    /* 3. 左半屏 (原始材质) */
    gl.setScissorTest(true);
    gl.setScissor(0, 0, splitX, size.height);
    gl.setViewport(0, 0, size.width, size.height); // viewport 保持全屏大小，确保透视不变
    if (camL.current) {
      camL.current.aspect = size.width / size.height; // aspect 保持全屏比例
      camL.current.updateProjectionMatrix();
      gl.render(sceneL, camL.current);
    }

    /* 4. 右半屏 (新材质) */
    gl.setScissor(splitX, 0, size.width - splitX, size.height);
    gl.setViewport(0, 0, size.width, size.height); // viewport 保持全屏大小
    gl.clearDepth(); // 清除深度缓冲，防止遮挡
    if (camR.current) {
      camR.current.aspect = size.width / size.height; // aspect 保持全屏比例
      camR.current.updateProjectionMatrix();
      gl.render(sceneR, camR.current);
    }

    /* 5. 恢复默认状态 */
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

// 一个简单的环境光组件，给右侧增加一些反射
function Environment() {
  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial color="#444" side={1} /> {/* BackSide */}
    </mesh>
  );
}

function SceneContent({
  materialType,
}: {
  materialType: "basic" | "advanced";
}) {
  const meshRef = useRef<any>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 32]} />
      {materialType === "basic" ? (
        <meshStandardMaterial color="#ff6b6b" roughness={0.8} />
      ) : (
        <meshPhysicalMaterial
          color="#4ecdc4"
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      )}
    </mesh>
  );
}

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
