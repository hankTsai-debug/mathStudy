import type { ComponentType, ReactNode } from 'react'
import * as Q from '../game/quizzes'
import type { Answer, Quiz } from '../game/quizzes'
import type { Strings } from '../i18n'
import * as V from './visuals'

export interface QuizConfig<D> {
  make: (round: number) => Quiz<D>
  Visual: ComponentType<V.VisualProps<D>>
  text: (t: Strings) => { prompt: (d: D) => string; hint: (d: D) => string }
  /** Choice label when the answer is a key (shape name, yes/no) rather than what is shown. */
  label?: (v: Answer, t: Strings) => ReactNode
}

// Keeps each entry's data type consistent, then erases it for the registry.
const cfg = <D,>(c: QuizConfig<D>) => c as unknown as QuizConfig<unknown>

export const QUIZZES = {
  add20: cfg({ make: Q.add20, Visual: V.Add20Visual, text: t => t.quiz.add20 }),
  blocks: cfg({ make: Q.blocks, Visual: V.BlocksVisual, text: t => t.quiz.blocks }),
  digit: cfg({ make: r => Q.digitValue(r), Visual: V.DigitVisual, text: t => t.quiz.digit }),
  column: cfg({ make: Q.column, Visual: V.ColumnVisual, text: t => t.quiz.column }),
  shapeName: cfg({ make: Q.shapeName, Visual: V.ShapeVisual, text: t => t.quiz.shapeName, label: (v, t) => t.shapes[v as Q.Shape] }),
  symmetry: cfg({ make: Q.symmetry, Visual: V.SymmetryVisual, text: t => t.quiz.symmetry, label: (v, t) => (v === 'yes' ? t.yes : t.no) }),
  measure: cfg({ make: Q.measure, Visual: V.MeasureVisual, text: t => t.quiz.measure }),
  array: cfg({ make: Q.array, Visual: V.ArrayVisual, text: t => t.quiz.array }),
  times: cfg({ make: Q.times, Visual: V.TimesVisual, text: t => t.quiz.times }),
  share: cfg({ make: Q.share, Visual: V.ShareVisual, text: t => t.quiz.share }),
  clock: cfg({ make: Q.clock, Visual: V.ClockVisual, text: t => t.quiz.clock }),
  coins: cfg({ make: Q.coins, Visual: V.CoinsVisual, text: t => t.quiz.coins }),
  change: cfg({ make: Q.change, Visual: V.ChangeVisual, text: t => t.quiz.change }),
  fracName: cfg({ make: Q.fracName, Visual: V.PieVisual, text: t => t.quiz.fracName }),
  fracLine: cfg({ make: Q.fracLine, Visual: V.FracLineVisual, text: t => t.quiz.fracLine }),
  fracEqual: cfg({ make: Q.fracEqual, Visual: V.FracEqualVisual, text: t => t.quiz.fracEqual }),
  bigPlace: cfg({ make: r => Q.bigPlace(r), Visual: V.DigitVisual, text: t => t.quiz.digit }),
  area: cfg({ make: Q.area, Visual: V.AreaVisual, text: t => t.quiz.area }),
  decimal: cfg({ make: Q.decimal, Visual: V.DecimalVisual, text: t => t.quiz.decimal }),
  pattern: cfg({ make: Q.pattern, Visual: V.PatternVisual, text: t => t.quiz.pattern }),
  balance: cfg({ make: Q.balance, Visual: V.BalanceVisual, text: t => t.quiz.balance }),
  legs: cfg({ make: Q.legs, Visual: V.LegsVisual, text: t => t.quiz.legs }),
}

export type QuizKind = keyof typeof QUIZZES
