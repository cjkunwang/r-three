import React from 'react'
import SceneCanvas from '@/components/SceneCanvas'
import SphereScene from '@/scenes/basic/SphereScene'

export default function SpherePage() {
  return (
    <SceneCanvas camera={{ position: [2.5, 2.5, 2.5], fov: 60 }}>
      <SphereScene />
    </SceneCanvas>
  )
}
