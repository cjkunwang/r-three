import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

export default function TorusScene() {
  const ref = useRef<Mesh>(null)
  useFrame((_state, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * 0.6
    ref.current.rotation.z += delta * 0.3
  })
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.7, 0.25, 160, 32]} />
      <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.25} />
    </mesh>
  )
}
