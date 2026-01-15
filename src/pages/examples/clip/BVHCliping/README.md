# BVH 剪裁截面（BVHCliping）

这个示例的目标是：对任意 `BufferGeometry` 和一条 `THREE.Plane`，实时计算“几何体与平面的交线”，并把交线拼成闭合轮廓后生成一个可渲染的“截面填充面”。

对应页面：`/clip/bvhCliping`

## 文件入口

- 场景与裁剪平面控制：[index.tsx](./index.tsx)
- 截面网格生成与对齐：[Section.tsx](./Section.tsx)
- BVH 求交与轮廓拼接工具：[src/utils/index.ts](../../../utils/index.ts)

## 整体流程（每一帧）

1. 更新裁剪平面 `plane.normal` / `plane.constant`（由 Leva 控制）。
2. 通过 BVH 遍历与平面可能相交的三角形，得到一堆“交线段” `Edge[]`。
3. 把 3D 线段端点投影到平面局部 2D（u/v 坐标系），建立邻接关系并拼成轮廓 `Vector2[][]`。
4. 将每个轮廓转换为 `THREE.Shape`，用 `THREE.ShapeGeometry` 生成截面填充网格。
5. 把截面网格旋转/平移到裁剪平面上，并控制显隐。

## 关键点 1：BVH 加速求交（bvhIntersectPlane）

位置：`src/utils/index.ts` 的 `bvhIntersectPlane`。

核心思路：

- 对几何体先调用 `computeBoundsTree()` 建立 BVH。
- 每帧用 `bvh.shapecast` 做“空间剪枝”：
  - `intersectsBounds`: 只要 AABB 与平面不相交，就整块裁掉（不再下钻）。
  - `intersectsTriangle`: 只对候选三角形做精确的“平面-三角形”求交。

伪代码：

```ts
bvh.shapecast({
  intersectsBounds: (box) =>
    box.intersectsPlane(plane) ? INTERSECTED : NOT_INTERSECTED,
  intersectsTriangle: (tri) => {
    if (planeIntersectTriangle(plane, tri, line)) out.push({ start, end });
    return false;
  },
});
```

这样做的好处是：三角形很多时，不需要每帧全量遍历所有三角形，而是只处理平面附近那部分 BVH 节点，性能会好很多。

## 关键点 2：平面与三角形求交（planeIntersectTriangle）

位置：`src/utils/index.ts` 的 `planeIntersectTriangle`（内部函数）。

思路：

1. 计算三角形三个顶点到平面的有符号距离 `da/db/dc`：
   - 同号（都 > 0 或都 < 0）说明三角形在平面同侧，不可能产生交线，直接返回 `false`。
2. 对三条边分别判断是否跨越平面：
   - 若 `da * db < 0` 说明 A、B 在平面两侧，在 AB 上做一次线性插值取交点。
3. 处理顶点恰好在平面上（`distance === 0`）的情况，把该顶点也当作交点候选。
4. 去重后，如果唯一交点数量刚好为 2，则这两个点组成“交线段”。

注意点：

- 这里用了 `da === 0` 的严格比较。实际运行里浮点误差会让“很接近 0”但不等于 0 的情况出现；如果你希望更稳，可以改成带 epsilon 的判断（例如 `Math.abs(da) < 1e-8`）。

## 关键点 3：交线段拼轮廓（edgesToPoints）

位置：`src/utils/index.ts` 的 `edgesToPoints`。

这个函数做两件事：

### 3.1 3D -> 2D 投影（建立平面局部坐标）

要在平面上“拼线段”，通常会先把点投影到平面局部 2D 坐标系：

- `n`: 平面法线（来自 `plane.normal`）。
- 构造 `u`：在平面内的 x 轴方向。
  - 默认用 `u = X × n`，若退化（n 平行 X）再用 `u = Y × n`。
- 构造 `v = n × u`，得到平面内的 y 轴方向。

然后对一个 3D 点 `p`：

- `x = p · u`
- `y = p · v`

得到 2D 点 `(x, y)`。

为了避免“每帧坐标系抖动导致轮廓跳变”，`Section.tsx` 会把同一套 `u/v` 传入 `edgesToPoints(edges, n, u, v)`，确保投影基一致。

### 3.2 建邻接表并提取连通分量

拼轮廓的简化实现：

1. 把每条线段的两个端点映射成索引（去重后得到 `points2D[]`）。
2. 用线段索引对建立邻接表 `adj[i] = [neighbor...]`。
3. 从未访问点出发，沿“未访问邻居”一路走出一条链 `chain`，得到一个轮廓。

这份实现是“够用的简化版”，适合很多规则网格的截面；但它不保证：

- 一定能正确闭合（遇到多分支时可能提前停止）。
- 能区分外轮廓与洞（孔洞需要额外的拓扑/包含关系判断）。
- 能处理自交、非常复杂的交线网络。

如果要更健壮，一般会：

- 以“边”为访问单位（而不是点），避免分叉时丢边；
- 在分叉处按转角选择下一条边，确保形成闭环；
- 对闭环做方向/面积计算与包含关系，区分 holes；
- 视情况引入容差合并策略（epsilon welding）。

## 关键点 4：轮廓 -> ShapeGeometry，并对齐到平面（Section.tsx）

位置：[Section.tsx](./Section.tsx)

核心逻辑：

- 通过 `bvhIntersectPlane(boundsTree, plane, edges)` 得到交线段。
- 通过 `edgesToPoints(edges, n, u, v)` 得到轮廓 `contours`。
- 对每个 `points`（一个轮廓）创建 `new THREE.Shape(points)`，再 `new THREE.ShapeGeometry(shapes)` 生成面片。
- 用 `makeBasis(u, v, n)` 生成旋转矩阵，把 Shape 默认所在的 XY 平面旋到当前裁剪平面方向。
- 平移到平面位置：
  - Three 的平面方程为 `n · x + constant = 0`，当 `n` 为单位向量时，平面上离原点最近点是 `x0 = -constant * n`。
  - 所以用 `position = n * (-plane.constant)` 放到正确位置。

## 渲染注意：截面重叠时的着色异常（Z-fighting）

当两个截面几乎共面/重叠时，深度值非常接近，会出现 Z-fighting（看起来像颜色闪烁、撕裂、局部被覆盖）。

本示例在 `Section.tsx` 做了两层缓解：

- 材质层面：`depthWrite={false}` + `polygonOffset`（让截面在深度比较中略微偏移）
- 位置层面：`planeOffset`（沿法线轻微推开一点点，避免严格共面）

如果你希望重叠区域做“布尔合并/混色规则”，就需要在轮廓层面对两个形状做 2D 布尔运算（union/intersection/subtract），这是更高一层的几何处理。
