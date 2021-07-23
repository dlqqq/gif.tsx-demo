import { GifReader } from 'omggif'
import {
  RefObject,
  DetailedHTMLProps,
  CanvasHTMLAttributes,
  useEffect,
  useState,
  MutableRefObject,
  useRef,
} from 'react'
import { extractFrames, Frame } from '../lib/extractFrames'

type HTMLCanvasElementProps = DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>

type GifControllerLoading = {
  canvasProps: HTMLCanvasElementProps
  loading: true
  error: false
}

type GifControllerError = {
  canvasProps: HTMLCanvasElementProps
  loading: false
  error: true
  errorMessage: string
}

type GifControllerResolved = {
  canvasProps: HTMLCanvasElementProps
  loading: false
  error: false
  frameIndex: MutableRefObject<number>
  playing: boolean
  play: () => void
  pause: () => void
  restart: () => void
  renderFrame: (frame: number) => void
  renderNextFrame: () => void
  renderPreviousFrame: () => void
  width: number
  height: number
}

type GifController = GifControllerLoading | GifControllerResolved | GifControllerError

export function useGifController(url: string, canvas: RefObject<HTMLCanvasElement | null>): GifController {
  type LoadingState = {
    loading: true
    error: false
  }

  type ErrorState = {
    loading: false
    error: true
    errorMessage: string
  }

  type ResolvedState = {
    loading: false
    error: false
    gifReader: GifReader
    frames: Frame[]
  }

  type State = LoadingState | ResolvedState | ErrorState

  const ctx = canvas.current?.getContext('2d')

  // asynchronous state variables strongly typed as a union such that properties
  // are only defined when `loading === true`.
  const [state, setState] = useState<State>({ loading: true, error: false })
  const [shouldUpdate, setShouldUpdate] = useState(false)
  const frameIndex = useRef(-1)

  // state variable returned by hook
  const [playing, setPlaying] = useState(false)
  // ref that is used internally
  const _playing = useRef(false)

  // Load GIF on initial render and when url changes.
  useEffect(() => {
    async function loadGif() {
      const response = await fetch(url)
      const buffer = await response.arrayBuffer()
      const uInt8Array = new Uint8Array(buffer)

      // Type cast is necessary because GifReader expects Buffer, which extends
      // Uint8Array. Doesn't *seem* to cause any runtime errors, but I'm sure
      // there's some edge case I'm not covering here.
      const gifReader = new GifReader(uInt8Array as Buffer)
      const frames = extractFrames(gifReader)

      if (!frames) {
        setState({ loading: false, error: true, errorMessage: 'Could not extract frames from GIF.' })
      } else {
        setState({ loading: false, error: false, gifReader, frames })
      }

      // must trigger re-render to ensure access to canvas ref
      setShouldUpdate(true)
    }
    loadGif()
  }, [url])

  // update if shouldUpdate gets set to true, i.e. on initial render
  useEffect(() => {
    if (shouldUpdate) {
      setShouldUpdate(false)
    }
  }, [shouldUpdate])

  useEffect(() => {
    if (playing) {
      _playing.current = true
      _iterateRenderLoop()
    } else {
      _playing.current = false
    }
    // ignore _iterateRenderLoop() as it is referentially unstable
    // eslint-disable-next-line
  }, [playing])

  // load first frame if not initialized
  useEffect(() => {
    if (!shouldUpdate && frameIndex.current === -1) renderNextFrame()
    // ignore renderNextFrame as it is referentially unstable
    // eslint-disable-next-line
  }, [frameIndex, shouldUpdate])

  if (state.loading === true || !canvas) return { canvasProps: { hidden: true }, loading: true, error: false }

  if (state.error === true)
    return { canvasProps: { hidden: true }, loading: false, error: true, errorMessage: state.errorMessage }

  const { width, height } = state.gifReader

  return {
    canvasProps: { width, height },
    loading: false,
    error: false,
    playing,
    play,
    pause,
    restart,
    frameIndex,
    renderFrame,
    renderNextFrame,
    renderPreviousFrame,
    width,
    height,
  }

  function play() {
    if (state.error || state.loading) return
    if (playing) return
    setPlaying(true)
  }

  function _iterateRenderLoop() {
    if (state.error || state.loading || !_playing.current) return

    const delay = state.frames[frameIndex.current].delay
    setTimeout(() => {
      renderNextFrame()
      _iterateRenderLoop()
    }, delay)
  }

  function pause() {
    setPlaying(false)
  }

  function restart() {
    frameIndex.current = 0
    setPlaying(true)
  }

  function renderFrame(frameIndex: number) {
    if (!ctx || state.loading === true || state.error === true) return
    if (frameIndex < 0 || frameIndex >= state.gifReader.numFrames()) return
    ctx.putImageData(state.frames[frameIndex].imageData, 0, 0)
  }

  function renderNextFrame() {
    if (!ctx || state.loading === true || state.error === true) return
    const nextFrame = frameIndex.current + 1 >= state.gifReader.numFrames() ? 0 : frameIndex.current + 1
    renderFrame(nextFrame)
    frameIndex.current = nextFrame
  }

  function renderPreviousFrame() {
    if (!ctx || state.loading === true || state.error === true) return
    const prevFrame = frameIndex.current - 1 < 0 ? state.gifReader.numFrames() - 1 : frameIndex.current - 1
    renderFrame(prevFrame)
    frameIndex.current = prevFrame
  }
}
