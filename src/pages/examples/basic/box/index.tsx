import React from 'react'
import SceneCanvas from '@/components/SceneCanvas'
import BoxScene from '@/scenes/basic/BoxScene'
import ExampleLayout from '@/components/ExampleLayout'
import readme from './README.md?raw'

export default function BoxPage() {
  return (
    <ExampleLayout
      canvas={<SceneCanvas className="canvas-fill"><BoxScene /></SceneCanvas>}
      source={readme}
    />
  )
}
