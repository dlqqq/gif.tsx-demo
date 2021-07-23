import React, { useRef } from 'react'
import { useGifController } from '../hooks/useGifController'

export function GifPlayer(): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gifController = useGifController('/cradle.gif', canvasRef)

  if (gifController.loading) {
    return null
  }

  if (gifController.error) {
    return null
  }

  const { play, pause, renderNextFrame, renderPreviousFrame, renderFrame } = gifController

  return (
    <div>
      <canvas {...gifController.canvasProps} ref={canvasRef} />
      <div>
        <button onClick={renderPreviousFrame}>Previous</button>
        <button onClick={play}>Play</button>
        <button onClick={pause}>Pause</button>
        <button onClick={renderNextFrame}>next</button>
      </div>
    </div>
  )
}
