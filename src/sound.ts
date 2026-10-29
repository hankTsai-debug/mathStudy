// Wordless sound cues, synthesised with Web Audio so there are no files to load:
// rising notes for counting, a chime when a ten is complete, a soft low note for a miss.

let ctx: AudioContext | null = null
let enabled = true

export function setSoundOn(on: boolean) { enabled = on }

function audio() {
  if (!enabled || typeof AudioContext === 'undefined') return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function note(freq: number, ms: number, type: OscillatorType = 'sine', gain = 0.18, at = 0) {
  const a = audio()
  if (!a) return
  const start = a.currentTime + at / 1000
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, start)
  g.gain.exponentialRampToValueAtTime(0.001, start + ms / 1000)
  osc.connect(g).connect(a.destination)
  osc.start(start)
  osc.stop(start + ms / 1000)
}

// A major pentatonic scale, so any run of counting notes sounds pleasant.
const SCALE = [0, 2, 4, 7, 9]
const pitch = (step: number) => 440 * 2 ** ((SCALE[step % 5] + 12 * Math.floor(step / 5) - 9) / 12)

export const sfx = {
  /** The n-th counting note (1, 2, 3…), each a step higher. */
  count: (n: number) => note(pitch(n + 2), 220, 'triangle'),
  pop: () => note(880, 90, 'sine', 0.12),
  /** A ten is complete. */
  chime: () => { note(1047, 500, 'sine', 0.16); note(1319, 600, 'sine', 0.12, 90); note(1568, 800, 'sine', 0.1, 180) },
  right: () => { note(784, 160, 'triangle'); note(1047, 300, 'triangle', 0.18, 120) },
  /** A gentle "not quite", never harsh. */
  miss: () => note(196, 280, 'sine', 0.2),
}
