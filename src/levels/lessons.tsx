// Worked examples shown before a level's practice ("watch me, then you try").
// Each step pairs a picture with one narrated line from `t.teach[kind]`, in the same order.
import type { ReactNode } from 'react'
import type { LevelKind } from '../islands'
import { TenFrame } from './shared'
import * as V from './visuals'

export interface LessonStep { show: ReactNode; eq?: string }

const frames = (...frames: ReactNode[]) => <div className="frames">{frames}</div>

export const LESSONS: Record<LevelKind, LessonStep[]> = {
  count: [
    { show: <V.Apples n={4} counted={0} /> },
    { show: <V.Apples n={4} counted={2} /> },
    { show: <V.Apples n={4} counted={4} /> },
    { show: <V.Apples n={4} counted={4} />, eq: '4' },
  ],
  line: [
    { show: <V.NumberLine frog={0} /> },
    { show: <V.NumberLine frog={2} /> },
    { show: <V.NumberLine frog={5} trail={[3, 4, 5]} /> },
    { show: <V.NumberLine frog={5} trail={[3, 4, 5]} />, eq: '2 + 3 = 5' },
  ],
  flash: [
    { show: <TenFrame filled={5} />, eq: '5' },
    { show: <TenFrame filled={7} />, eq: '5 + 2 = 7' },
    { show: <TenFrame filled={4} />, eq: '5 − 1 = 4' },
  ],
  makeTen: [
    { show: <TenFrame filled={7} /> },
    { show: <TenFrame filled={7} extra={3} /> },
    { show: <TenFrame filled={7} extra={3} />, eq: '7 + 3 = 10' },
  ],
  teen: [
    { show: frames(<TenFrame key="a" filled={10} />) },
    { show: frames(<TenFrame key="a" filled={10} />, <TenFrame key="b" filled={0} extra={3} />) },
    { show: frames(<TenFrame key="a" filled={10} />, <TenFrame key="b" filled={0} extra={3} />), eq: '10 + 3 = 13' },
  ],
  add20: [
    { show: <V.Add20Visual data={{ a: 8, b: 5, op: '+' }} solved={false} /> },
    { show: <V.Add20Visual data={{ a: 8, b: 5, op: '+' }} solved={false} />, eq: '5 = 2 + 3' },
    { show: <V.Add20Visual data={{ a: 8, b: 5, op: '+' }} solved={false} />, eq: '8 + 5 = 10 + 3 = 13' },
    { show: <V.Add20Visual data={{ a: 13, b: 5, op: '-' }} solved={false} />, eq: '13 − 3 − 2 = 8' },
  ],
  blocks: [
    { show: <V.BlocksVisual data={{ n: 1 }} solved={false} />, eq: '1' },
    { show: <V.BlocksVisual data={{ n: 10 }} solved={false} />, eq: '10' },
    { show: <V.BlocksVisual data={{ n: 100 }} solved={false} />, eq: '100' },
    { show: <V.BlocksVisual data={{ n: 234 }} solved={false} />, eq: '200 + 30 + 4 = 234' },
  ],
  digit: [
    { show: <V.DigitVisual data={{ n: 352, digit: 2, place: 0 }} solved={false} />, eq: '2' },
    { show: <V.DigitVisual data={{ n: 352, digit: 5, place: 1 }} solved={false} />, eq: '50' },
    { show: <V.DigitVisual data={{ n: 352, digit: 3, place: 2 }} solved={false} />, eq: '300' },
    { show: <V.DigitVisual data={{ n: 352, digit: 0, place: -1 }} solved={false} />, eq: '300 + 50 + 2 = 352' },
  ],
  column: [
    { show: <V.ColumnVisual data={{ a: 27, b: 15, op: '+' }} solved={false} /> },
    { show: <V.ColumnVisual data={{ a: 27, b: 15, op: '+' }} solved={false} />, eq: '7 + 5 = 12' },
    { show: <V.ColumnVisual data={{ a: 27, b: 15, op: '+' }} solved />, eq: '2 + 1 + 1 = 4' },
    { show: <V.ColumnVisual data={{ a: 42, b: 15, op: '-' }} solved={false} />, eq: '12 − 5 = 7' },
    { show: <V.ColumnVisual data={{ a: 42, b: 15, op: '-' }} solved />, eq: '3 − 1 = 2' },
  ],
  shapeName: [
    { show: <V.ShapeVisual data={{ shape: 'triangle', rotate: 0 }} solved={false} />, eq: '3' },
    { show: <V.ShapeVisual data={{ shape: 'square', rotate: 0 }} solved={false} />, eq: '4' },
    { show: <V.ShapeVisual data={{ shape: 'hexagon', rotate: 0 }} solved={false} />, eq: '6' },
    { show: <V.ShapeVisual data={{ shape: 'triangle', rotate: 180 }} solved={false} />, eq: '3' },
  ],
  symmetry: [
    { show: <V.SymmetryVisual data={{ shape: 'heart', line: [100, 12, 100, 188] }} solved={false} />, eq: '✓' },
    { show: <V.SymmetryVisual data={{ shape: 'heart', line: [12, 100, 188, 100] }} solved={false} />, eq: '✗' },
    { show: <V.SymmetryVisual data={{ shape: 'rectangle', line: [30, 60, 170, 140] }} solved={false} />, eq: '✗' },
  ],
  measure: [
    { show: <V.MeasureVisual data={{ start: 0, length: 5 }} solved={false} />, eq: '5' },
    { show: <V.MeasureVisual data={{ start: 2, length: 5 }} solved={false} /> },
    { show: <V.MeasureVisual data={{ start: 2, length: 5 }} solved={false} />, eq: '7 − 2 = 5' },
  ],
  array: [
    { show: <V.ArrayVisual data={{ rows: 3, cols: 4 }} solved={false} /> },
    { show: <V.ArrayVisual data={{ rows: 3, cols: 4 }} solved={false} />, eq: '4, 8, 12' },
    { show: <V.ArrayVisual data={{ rows: 3, cols: 4 }} solved={false} />, eq: '3 × 4 = 12' },
  ],
  times: [
    { show: <V.TimesVisual data={{ a: 3, b: 5 }} solved={false} /> },
    { show: <V.TimesVisual data={{ a: 3, b: 5 }} solved={false} />, eq: '5, 10, 15' },
    { show: <V.TimesVisual data={{ a: 3, b: 5 }} solved={false} />, eq: '3 × 5 = 15' },
  ],
  share: [
    { show: <V.ShareVisual data={{ total: 12, groups: 3 }} solved={false} /> },
    { show: <V.ShareVisual data={{ total: 12, groups: 3 }} solved={false} /> },
    { show: <V.ShareVisual data={{ total: 12, groups: 3 }} solved />, eq: '12 ÷ 3 = 4' },
  ],
  clock: [
    { show: <V.ClockVisual data={{ h: 3, m: 0 }} solved={false} />, eq: '3:00' },
    { show: <V.ClockVisual data={{ h: 3, m: 15 }} solved={false} />, eq: '3:15' },
    { show: <V.ClockVisual data={{ h: 3, m: 30 }} solved={false} />, eq: '3:30' },
  ],
  coins: [
    { show: <V.CoinsVisual data={{ coins: [1, 5, 10, 50] }} solved={false} /> },
    { show: <V.CoinsVisual data={{ coins: [50, 10, 10, 5, 1, 1] }} solved={false} />, eq: '50, 60, 70' },
    { show: <V.CoinsVisual data={{ coins: [50, 10, 10, 5, 1, 1] }} solved={false} />, eq: '75, 76, 77' },
  ],
  change: [
    { show: <V.ChangeVisual data={{ price: 37, paid: 50 }} solved={false} /> },
    { show: <V.ChangeVisual data={{ price: 37, paid: 50 }} solved={false} />, eq: '40 − 37 = 3' },
    { show: <V.ChangeVisual data={{ price: 37, paid: 50 }} solved={false} />, eq: '50 − 40 = 10, 3 + 10 = 13' },
  ],
  fracName: [
    { show: <V.PieVisual data={{ k: 0, d: 4 }} solved={false} /> },
    { show: <V.PieVisual data={{ k: 1, d: 4 }} solved={false} />, eq: '1/4' },
    { show: <V.PieVisual data={{ k: 3, d: 4 }} solved={false} />, eq: '3/4' },
  ],
  fracLine: [
    { show: <V.FracLineVisual data={{ k: 0, d: 4 }} solved={false} /> },
    { show: <V.FracLineVisual data={{ k: 1, d: 4 }} solved={false} />, eq: '1/4' },
    { show: <V.FracLineVisual data={{ k: 3, d: 4 }} solved={false} />, eq: '3/4' },
  ],
  fracEqual: [
    { show: <V.FracEqualVisual data={{ k: 1, d: 2, m: 2 }} solved={false} />, eq: '1/2' },
    { show: <V.FracEqualVisual data={{ k: 1, d: 2, m: 2 }} solved />, eq: '2/4' },
    { show: <V.FracEqualVisual data={{ k: 1, d: 2, m: 2 }} solved />, eq: '1/2 = 2/4' },
  ],
  bigPlace: [
    { show: <V.DigitVisual data={{ n: 45231, digit: 0, place: -1 }} solved={false} /> },
    { show: <V.DigitVisual data={{ n: 45231, digit: 5, place: 3 }} solved={false} />, eq: '5,000' },
    { show: <V.DigitVisual data={{ n: 45231, digit: 4, place: 4 }} solved={false} />, eq: '40,000' },
  ],
  area: [
    { show: <V.AreaVisual data={{ w: 4, h: 3, ask: 'area' }} solved={false} /> },
    { show: <V.AreaVisual data={{ w: 4, h: 3, ask: 'area' }} solved={false} />, eq: '3 × 4 = 12' },
    { show: <V.AreaVisual data={{ w: 4, h: 3, ask: 'perimeter' }} solved={false} />, eq: '4 + 3 + 4 + 3 = 14' },
  ],
  decimal: [
    { show: <V.DecimalVisual data={{ whole: 0, k: 10 }} solved={false} />, eq: '1' },
    { show: <V.DecimalVisual data={{ whole: 0, k: 1 }} solved={false} />, eq: '0.1' },
    { show: <V.DecimalVisual data={{ whole: 1, k: 3 }} solved={false} />, eq: '1.3' },
  ],
  pattern: [
    { show: <V.PatternVisual data={{ terms: [2, 5, 8, 11] }} solved={false} />, eq: '+3  +3  +3' },
    { show: <V.PatternVisual data={{ terms: [2, 5, 8, 11] }} solved />, eq: '11 + 3 = 14' },
    { show: <V.PatternVisual data={{ terms: [1, 2, 4, 7] }} solved />, eq: '+1  +2  +3  +4' },
  ],
  balance: [
    { show: <V.BalanceVisual data={{ fruit: '🍎', copies: 3, extra: 0, total: 12 }} solved={false} /> },
    { show: <V.BalanceVisual data={{ fruit: '🍎', copies: 3, extra: 0, total: 12 }} solved={false} />, eq: '12 ÷ 3 = 4' },
    { show: <V.BalanceVisual data={{ fruit: '🍎', copies: 2, extra: 4, total: 14 }} solved={false} />, eq: '14 − 4 = 10, 10 ÷ 2 = 5' },
  ],
  legs: [
    { show: <V.LegsVisual data={{ heads: 5, legs: 14, rabbits: 2 }} solved={false} />, eq: '🐔 2  🐰 4' },
    { show: <V.LegsVisual data={{ heads: 5, legs: 14, rabbits: 2 }} solved={false} />, eq: '5 × 2 = 10, 14 − 10 = 4' },
    { show: <V.LegsVisual data={{ heads: 5, legs: 14, rabbits: 2 }} solved />, eq: '4 ÷ 2 = 2' },
  ],
}
