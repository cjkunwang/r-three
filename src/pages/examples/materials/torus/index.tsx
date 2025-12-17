import React from 'react'
import SceneCanvas from '@/components/SceneCanvas'
import TorusScene from '@/scenes/materials/TorusScene'
import ExampleLayout from '@/components/ExampleLayout'
import readme from './README.md?raw'

export default function TorusPage() {
  return (
    <ExampleLayout
      canvas={<SceneCanvas className="canvas-fill" camera={{ position: [3, 2.5, 3], fov: 60 }}><TorusScene /></SceneCanvas>}
      source={readme}
    />
  )
}
