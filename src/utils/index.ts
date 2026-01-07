import * as THREE from 'three';
import { MeshBVH, INTERSECTED, NOT_INTERSECTED } from 'three-mesh-bvh';

type Pt = THREE.Vector2;
export function makeConvex(pts: Pt[]): Pt[] {
    if (pts.length < 3) return pts;

    /* 1. 去重 */
    const seen = new Set<string>();
    const u: Pt[] = [];
    pts.forEach(p => {
        const k = p.x.toFixed(6) + ',' + p.y.toFixed(6);
        if (!seen.has(k)) { seen.add(k); u.push(p); }
    });
    if (u.length < 3) return u;

    /* 2. 按 x 升序，同 x 按 y 升序 */
    u.sort((a, b) => (a.x - b.x) || (a.y - b.y));

    /* 3. Monotone Chain 上下链 */
    const cross = (O: Pt, A: Pt, B: Pt) => (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);

    const lower: Pt[] = [];
    for (const p of u) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
            lower.pop();
        lower.push(p);
    }

    const upper: Pt[] = [];
    for (let i = u.length - 1; i >= 0; i--) {
        const p = u[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
            upper.pop();
        upper.push(p);
    }

    /* 4. 合并，去掉末尾重复起点 */
    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

export interface Edge {
    start: THREE.Vector3;
    end: THREE.Vector3;
}

export function edgesToPoints(
    edges: Edge[],
    planeNormal = new THREE.Vector3(0, 1, 0),
    givenU?: THREE.Vector3,
    givenV?: THREE.Vector3
): THREE.Vector2[][] {
    if (edges.length === 0) return [];

    // 1. 把所有端点投影到局部 2D，方便排序
    const u = new THREE.Vector3();  // 局部 x
    const v = new THREE.Vector3();  // 局部 y

    if (givenU && givenV) {
        u.copy(givenU);
        v.copy(givenV);
    } else {
        u.set(1, 0, 0).cross(planeNormal).normalize();
        if (u.length() === 0) u.set(0, 1, 0).cross(planeNormal).normalize();
        v.crossVectors(planeNormal, u).normalize();
    }

    const points2D: THREE.Vector2[] = [];
    const indexMap = new Map<string, number>();  // string key -> index
    const getKey = (p: THREE.Vector3) => `${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)}`;

    const edgeIndices: [number, number][] = [];

    edges.forEach(e => {
        const idxs: number[] = [];
        ([e.start, e.end]).forEach(p => {
            const key = getKey(p);
            if (!indexMap.has(key)) {
                indexMap.set(key, points2D.length);
                const x = p.dot(u);
                const y = p.dot(v);
                points2D.push(new THREE.Vector2(x, y));
                idxs.push(points2D.length - 1);
            } else {
                idxs.push(indexMap.get(key)!);
            }
        });
        edgeIndices.push([idxs[0], idxs[1]]);
    });

    // 2. 建邻接表
    const adj: number[][] = new Array(points2D.length).fill(null).map(() => []);
    edgeIndices.forEach(([i, j]) => {
        if (i === j) return; // ignore degenerate edges
        adj[i].push(j);
        adj[j].push(i);
    });

    // 3. 提取所有连通分量（闭环）
    const contours: THREE.Vector2[][] = [];
    const visited = new Uint8Array(points2D.length);

    for (let startIdx = 0; startIdx < points2D.length; startIdx++) {
        if (visited[startIdx]) continue;
        // 如果该点没有邻居，跳过（可能是孤立点，虽然不应该出现）
        if (adj[startIdx].length === 0) continue;

        const chain: number[] = [];
        let curr = startIdx;
        visited[curr] = 1;
        chain.push(curr);

        while (true) {
            let next = -1;
            // 优先找未访问的邻居
            for (const n of adj[curr]) {
                if (!visited[n]) {
                    next = n;
                    break;
                }
            }

            if (next !== -1) {
                visited[next] = 1;
                chain.push(next);
                curr = next;
            } else {
                // 没有未访问的邻居，检查是否闭环
                // 对于简单闭环，最后一个点的邻居里应该包含起点
                // 但因为我们也可能遇到非闭合路径（如果网格有洞），这里就停止
                break;
            }
        }

        if (chain.length >= 3) {
            contours.push(chain.map(i => points2D[i]));
        }
    }

    return contours;
}

function planeIntersectTriangle(plane: THREE.Plane, tri: THREE.Triangle, target: THREE.Line3): boolean {
    const { a, b, c } = tri;
    const da = plane.distanceToPoint(a);
    const db = plane.distanceToPoint(b);
    const dc = plane.distanceToPoint(c);

    // All on same side?
    if (da > 0 && db > 0 && dc > 0) return false;
    if (da < 0 && db < 0 && dc < 0) return false;

    const points: THREE.Vector3[] = [];

    // Intersect AB
    if (da * db < 0) {
        const t = da / (da - db);
        points.push(new THREE.Vector3().copy(a).lerp(b, t));
    }
    // Intersect BC
    if (db * dc < 0) {
        const t = db / (db - dc);
        points.push(new THREE.Vector3().copy(b).lerp(c, t));
    }
    // Intersect CA
    if (dc * da < 0) {
        const t = dc / (dc - da);
        points.push(new THREE.Vector3().copy(c).lerp(a, t));
    }

    // Handle vertices on plane
    if (da === 0) points.push(a.clone());
    if (db === 0) points.push(b.clone());
    if (dc === 0) points.push(c.clone());

    // Filter unique points
    const unique: THREE.Vector3[] = [];
    for (const p of points) {
        let duplicate = false;
        for (const u of unique) {
            if (u.distanceToSquared(p) < 1e-12) {
                duplicate = true;
                break;
            }
        }
        if (!duplicate) unique.push(p);
    }

    if (unique.length === 2) {
        target.start.copy(unique[0]);
        target.end.copy(unique[1]);
        return true;
    }

    return false;
}

export function bvhIntersectPlane(bvh: MeshBVH, plane: THREE.Plane, out: Edge[] = []) {
    bvh.shapecast({
        // 必须给出：包围盒与平面是否相交
        intersectsBounds: (box) =>
            box.intersectsPlane(plane) ? INTERSECTED : NOT_INTERSECTED,

        // 再处理三角
        intersectsTriangle: (tri) => {
            const line = new THREE.Line3();
            if (planeIntersectTriangle(plane, tri, line))
                out.push({ start: line.start.clone(), end: line.end.clone() });
            return false; // 不继续递归
        }
    });
    return out;
}


