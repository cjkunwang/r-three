import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

export default function SphereScene() {
  const ref = useRef<Mesh>(null)
  useFrame((_state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="#10b981" />
    </mesh>
  )
}
