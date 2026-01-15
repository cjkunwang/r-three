import * as THREE from "three";

export default function createProjectionMaterial(
  texture: THREE.Texture,
  projectorCamera: THREE.PerspectiveCamera
) {
  const uniforms = {
    projTexture: { value: texture },
    projectorViewProjectionMatrix: { value: new THREE.Matrix4() },
    baseColor: { value: new THREE.Color(0x333333) },
    opacity: { value: 1.0 },
    useFrustumCulling: { value: true },
    featherEdges: { value: true },
    projectorPosition: { value: projectorCamera.position.clone() },
  };

  return new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D projTexture;
      uniform mat4 projectorViewProjectionMatrix;
      uniform vec3 baseColor;
      uniform float opacity;
      uniform bool useFrustumCulling;
      uniform bool featherEdges;
      uniform vec3 projectorPosition;
      
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      
      void main() {
        // 将世界坐标转换为投影机的NDC坐标
        vec4 projCoord = projectorViewProjectionMatrix * vec4(vWorldPosition, 1.0);
        
        // 透视除法
        if (projCoord.w <= 0.0) {
          gl_FragColor = vec4(baseColor, opacity);
          return;
        }
        
        projCoord.xyz /= projCoord.w;
        
        // 检查是否在投影机视锥体内
        bool inFrustum = projCoord.x >= -1.0 && projCoord.x <= 1.0 &&
                         projCoord.y >= -1.0 && projCoord.y <= 1.0 &&
                         projCoord.z >= -1.0 && projCoord.z <= 1.0;
        
        if (useFrustumCulling && !inFrustum) {
          gl_FragColor = vec4(baseColor, opacity);
          return;
        }
        
        // 将NDC转换为纹理坐标
        vec2 uv = projCoord.xy * 0.5 + 0.5;
        
        // 边缘羽化
        float feather = 1.0;
        if (featherEdges) {
          vec2 distanceToEdge = vec2(
            0.5 - abs(uv.x - 0.5),
            0.5 - abs(uv.y - 0.5)
          );
          feather = smoothstep(0.0, 0.1, min(distanceToEdge.x, distanceToEdge.y));
        }
        
        // 采样纹理
        vec4 texColor = texture2D(projTexture, uv);
        
        // 根据法线方向调整亮度（模拟真实投影衰减）
        vec3 projectorDir = normalize(projectorPosition - vWorldPosition);
        float angleFactor = max(dot(vNormal, projectorDir), 0.0);
        angleFactor = pow(angleFactor, 0.5); // 调整衰减曲线
        
        // 最终颜色混合
        vec3 finalColor = mix(baseColor, texColor.rgb * angleFactor, feather * texColor.a);
        gl_FragColor = vec4(finalColor, opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
}
