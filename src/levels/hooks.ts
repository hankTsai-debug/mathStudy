import { useCallback, useEffect, useRef, useState } from 'react'
import type { Answer } from '../game/quizzes'
import { sfx } from '../sound'
import type { HelpMode } from './wordless/kit'

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

export type Feedback = { mode: 'idle' } | { mode: HelpMode; chose: Answer | null }

/**
 * Wordless feedback: tracks misses and turns each into the next level of help (see HelpMode):
 * 1 show the choice, 2 the strategy, 3 count it out and pulse the right choice.
 */
export function useFeedback() {
  const [fb, setFb] = useState<Feedback>({ mode: 'idle' })
  const [misses, setMisses] = useState(0)
  // Bumped on every change so the picture remounts and its animations replay.
  const [run, setRun] = useState(0)
  const later = useLater()
  return {
    fb, run,
    pulse: misses >= 3,
    /** Records a miss and returns which help it earns (1, 2 or 3). */
    miss(chose: Answer) {
      const n = misses + 1
      setMisses(n)
      setFb({ mode: n === 1 ? 'wrong' : n === 2 ? 'strategy' : 'reveal', chose })
      setRun(r => r + 1)
      sfx.miss()
      return Math.min(n, 3)
    },
    solve() { setFb({ mode: 'solved', chose: null }); setRun(r => r + 1) },
    later,
  }
}
