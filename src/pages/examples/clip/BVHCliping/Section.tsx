import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Edge, edgesToPoints, bvhIntersectPlane } from "@/utils";

interface SectionProps {
  geometry: THREE.BufferGeometry;
  plane: THREE.Plane;
  color: THREE.ColorRepresentation;
  renderOrder?: number;
  planeOffset?: number;
}

export const Section = ({
  geometry,
  plane,
  color,
  renderOrder = 10,
  planeOffset = 0,
}: SectionProps) => {
  const sectionMeshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // @ts-ignore
    if (!geometry.boundsTree) return;

    const edges: Edge[] = [];
    bvhIntersectPlane((geometry as any).boundsTree, plane, edges);

    if (edges.length > 0 && sectionMeshRef.current) {
      // Pass the same u, v basis vectors to edgesToPoints to ensure consistency
      const n = plane.normal.clone();
      const u = new THREE.Vector3(1, 0, 0).cross(n).normalize();
      if (u.length() === 0) u.set(0, 1, 0).cross(n).normalize();
      const v = new THREE.Vector3().crossVectors(n, u).normalize();

      const contours = edgesToPoints(edges, n, u, v);

      const shapes: THREE.Shape[] = [];
      contours.forEach((points) => {
        if (points.length > 2) {
          shapes.push(new THREE.Shape(points));
        }
      });

      if (shapes.length > 0) {
        sectionMeshRef.current.geometry.dispose();
        sectionMeshRef.current.geometry = new THREE.ShapeGeometry(shapes);

        // Align mesh to plane
        const m = new THREE.Matrix4().makeBasis(u, v, n);
        sectionMeshRef.current.quaternion.setFromRotationMatrix(m);
        sectionMeshRef.current.position
          .copy(n)
          .multiplyScalar(-plane.constant)
          .addScaledVector(n, planeOffset);
        sectionMeshRef.current.visible = true;
      } else {
        sectionMeshRef.current.visible = false;
      }
    } else if (sectionMeshRef.current) {
      sectionMeshRef.current.visible = false;
    }
  });

  return (
    <mesh ref={sectionMeshRef} renderOrder={renderOrder}>
      <bufferGeometry />
      <meshBasicMaterial
        color={color}
        side={THREE.DoubleSide}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
};
