import { useCallback, useEffect, useRef } from 'react'

/** setTimeout that is cancelled when the component unmounts (leaving or next round). */
export function useLater() {
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])
}

/**
 * Runs a round's opening step on mount. StrictMode's dev double-mount runs it twice,
 * which is fine because useLater clears the first run's timers in between.
 */
export function useOnMount(fn: () => void) {
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fn() }, [])
}
