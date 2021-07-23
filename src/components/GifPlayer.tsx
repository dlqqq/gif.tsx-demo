import React, { useRef } from 'react'
import { useGifController } from '../hooks/useGifController'

export function GifPlayer(): JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gifController = useGifController('/cradle.gif', canvasRef, true)

  if (gifController.loading) {
    return null
  }

  if (gifController.error) {
    return null
  }

  const { playing, play, pause, restart, renderNextFrame, renderPreviousFrame, width, height } = gifController

  return (
    <div>
      <canvas {...gifController.canvasProps} ref={canvasRef} />
      <div style={{ display: 'flex', gap: 16, justifyContent: 'space-around' }}>
        <button onClick={renderPreviousFrame}>Previous</button>
        {playing ? <button onClick={pause}>Pause</button> : <button onClick={play}>Play</button>}
        <button onClick={restart}>Restart</button>
        <button onClick={renderNextFrame}>Next</button>
      </div>
      <div>
        <p>Width: {width}</p>
        <p>Height: {height}</p>
      </div>
    </div>
  )
}
