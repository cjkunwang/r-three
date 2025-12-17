import React, { ReactNode, useEffect, useState } from 'react'
import MarkdownPanel from '@/components/MarkdownPanel'

type Props = {
  canvas: ReactNode
  source: string
}

export default function ExampleLayout({ canvas, source }: Props) {
  const [full, setFull] = useState(false)
  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFull(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full])
  return (
    <div className="example">
      <div className="example-main">
        <div className="canvas-pane">
          <div className="canvas-toolbar">
            <button className="btn" onClick={() => setFull(true)}>全屏展示</button>
          </div>
          {canvas}
        </div>
        <div className="doc-pane">
          <MarkdownPanel source={source} />
        </div>
      </div>

      {full && (
        <div className="example-overlay">
          <div className="overlay-bar">
            <button className="btn" onClick={() => setFull(false)}>退出全屏</button>
          </div>
          <div className="overlay-canvas">
            {canvas}
          </div>
        </div>
      )}
    </div>
  )
}
