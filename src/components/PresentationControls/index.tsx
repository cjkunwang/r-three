import { useRef, useEffect, ReactNode } from "react"; // 引入 React 的 hooks：useRef 和 useEffect
import { useFrame, useThree } from "@react-three/fiber"; // 引入 R3F 的 hooks：useFrame 和 useThree
import * as THREE from "three"; // 引入 Three.js 核心库

function PresentationControls({
  // 定义 PresentationControls 组件
  children, // 子组件
  speed = 1, // 旋转速度，默认为 1
  snap = true, // 是否自动回正，默认为 true
  polar = [0, Math.PI], // 垂直旋转范围，默认为 [0, PI]
  azimuth = [-Infinity, Infinity], // 水平旋转范围，默认为无限
  eps = 0.01, // 回正阈值，默认为 0.01
}: {
  children: ReactNode;
  speed: number;
  snap: boolean;
  polar: [number, number];
  azimuth: [number, number];
  eps: number;
}) {
  // 组件参数解构结束
  const groupRef = useRef<THREE.Group>(null); // 创建一个 ref 用于引用 group 元素
  const { gl, size } = useThree(); // 获取 Three.js 的 gl 上下文和画布尺寸 size

  // 记录交互状态
  const state = useRef({
    // 使用 useRef 存储交互状态，避免重新渲染
    down: false, // 鼠标/触摸是否按下
    last: [0, 0], // 上一次鼠标/触摸的位置坐标
    polar: 0, // 当前垂直弧度
    azimuth: 0, // 当前水平弧度
    targetPolar: 0, // 目标垂直弧度
    targetAzimuth: 0, // 目标水平弧度
  }); // 状态初始化结束

  useEffect(() => {
    // 使用 useEffect 处理副作用，主要是事件监听
    const el = gl.domElement; // 获取 canvas DOM 元素
    const onPointerDown = (e: PointerEvent) => {
      // 定义按下事件处理函数
      state.current.down = true; // 标记状态为按下
      state.current.last = [e.clientX, e.clientY]; // 记录当前位置
      el.setPointerCapture(e.pointerId); // 捕获指针事件，防止拖出画布失效
    }; // 按下事件结束
    const onPointerMove = (e: PointerEvent) => {
      // 定义移动事件处理函数
      if (!state.current.down) return; // 如果未按下，则不处理
      const dx = e.clientX - state.current.last[0]; // 计算 X 轴位移
      const dy = e.clientY - state.current.last[1]; // 计算 Y 轴位移
      state.current.last = [e.clientX, e.clientY]; // 更新上一次位置

      // 水平拖拽 → azimuth，垂直 → polar
      state.current.targetAzimuth -= (dx / size.width) * Math.PI * speed; // 更新目标水平角度
      state.current.targetPolar += (dy / size.height) * Math.PI * speed; // 更新目标垂直角度

      //  clamp 到给定范围
      const [minP, maxP] = polar; // 解构垂直范围
      const [minA, maxA] = azimuth; // 解构水平范围
      state.current.targetPolar = THREE.MathUtils.clamp(
        // 限制垂直角度在范围内
        state.current.targetPolar, // 当前目标垂直角度
        minP, // 最小值
        maxP // 最大值
      ); // 限制垂直角度结束
      state.current.targetAzimuth = THREE.MathUtils.clamp(
        // 限制水平角度在范围内
        state.current.targetAzimuth, // 当前目标水平角度
        minA, // 最小值
        maxA // 最大值
      ); // 限制水平角度结束
    }; // 移动事件结束
    const onPointerUp = (e: PointerEvent) => {
      // 定义抬起事件处理函数
      state.current.down = false; // 标记状态为未按下
      el.releasePointerCapture(e.pointerId); // 释放指针捕获
      if (snap) {
        // 如果开启了自动回正
        // 回正到初始 0（也可改成任意角度）
        state.current.targetPolar = 0; // 目标垂直角度设为 0
        state.current.targetAzimuth = 0; // 目标水平角度设为 0
      } // 回正判断结束
    }; // 抬起事件结束

    el.addEventListener("pointerdown", onPointerDown); // 添加按下事件监听
    el.addEventListener("pointermove", onPointerMove); // 添加移动事件监听
    el.addEventListener("pointerup", onPointerUp); // 添加抬起事件监听
    return () => {
      // 清理函数
      el.removeEventListener("pointerdown", onPointerDown); // 移除按下事件监听
      el.removeEventListener("pointermove", onPointerMove); // 移除移动事件监听
      el.removeEventListener("pointerup", onPointerUp); // 移除抬起事件监听
    }; // 清理函数结束
  }, [gl, size, speed, snap, polar, azimuth]); // 依赖项列表

  useFrame(() => {
    // 使用 useFrame 钩子，每一帧执行
    // 弹簧插值（阻尼系数自己调）

    state.current.polar = THREE.MathUtils.lerp(
      // 对垂直角度进行线性插值
      state.current.polar, // 当前垂直角度
      state.current.targetPolar, // 目标垂直角度
      eps // 插值因子，控制平滑度
    );
    state.current.azimuth = THREE.MathUtils.lerp(
      // 对水平角度进行线性插值
      state.current.azimuth, // 当前水平角度
      state.current.targetAzimuth, // 目标水平角度
      eps // 插值因子
    );

    // 应用旋转
    const { polar, azimuth } = state.current; // 解构当前的极角和方位角
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(polar, azimuth, 0, "YXZ") // 创建欧拉角，顺序为 YXZ
    );
    // 将 group 的旋转球面插值到目标四元数 (1表示直接赋值)
    groupRef.current && groupRef.current.quaternion.slerp(q, 1);
  });

  return <group ref={groupRef}>{children}</group>; // 返回 group 元素，包裹子组件
} // 组件结束
export default PresentationControls; // 导出组件
