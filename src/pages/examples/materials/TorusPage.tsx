import React from 'react'
import SceneCanvas from '@/components/SceneCanvas'
import TorusScene from '@/scenes/materials/TorusScene'

export default function TorusPage() {
  return (
    <SceneCanvas camera={{ position: [3, 2.5, 3], fov: 60 }}>
      <TorusScene />
    </SceneCanvas>
  )
}
