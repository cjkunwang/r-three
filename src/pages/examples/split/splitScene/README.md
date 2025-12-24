# 同屏异构 (Split Scene)

本示例展示了如何实现**两个完全不同的场景**在同一个 Canvas 中并排显示，并且**共用一个控制器**。

## 实现思路

1.  **独立场景实例**：
    *   使用 `new Scene()` 创建了两个独立的 Three.js 场景对象：`sceneL` 和 `sceneR`。
    *   这保证了左右两侧的物体、光照、背景色互不干扰。

2.  **React Portals**：
    *   利用 R3F 的 `createPortal` API，将不同的 React 组件树（组件内容）分别“传送”渲染到上述两个独立的场景中。
    *   左侧显示 `BoxScene`，右侧显示 `TorusScene`。

3.  **相机同步 (Camera Sync)**：
    *   虽然有两个独立的渲染相机，但我们只使用默认的主相机（由 `OrbitControls` 控制）作为交互源。
    *   在每一帧（`useFrame`）中，将主相机的位置（Position）和旋转（Quaternion）完全复制给左右两个渲染相机。
    *   这实现了“操作一个控制器，同时驱动两个视角”的效果。

4.  **分屏渲染**：
    *   同样使用 `gl.setScissor` 将屏幕一分为二，左半边渲染 `sceneL`，右半边渲染 `sceneR`。
