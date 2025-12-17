import React from 'react'
import SceneCanvas from '@/components/SceneCanvas'
import SphereScene from '@/scenes/basic/SphereScene'
import ExampleLayout from '@/components/ExampleLayout'
import readme from './README.md?raw'

export default function SpherePage() {
  return (
    <ExampleLayout
      canvas={<SceneCanvas className="canvas-fill" camera={{ position: [2.5, 2.5, 2.5], fov: 60 }}><SphereScene /></SceneCanvas>}
      source={readme}
    />
  )
}
