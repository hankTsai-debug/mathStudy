// Every island's wordless lessons and help, in one registry.
import type { LevelKind } from '../../islands'
import type { QuizKind } from '../quizConfig'
import * as bay from './bay'
import * as challenge from './challenge'
import * as farm from './farm'
import * as forest from './forest'
import * as kitchen from './kitchen'
import * as market from './market'
import * as place from './place'
import * as port from './port'
import * as shapes from './shapes'
import type { Helps, Lessons } from './kit'

const ISLANDS = [forest, bay, place, shapes, farm, market, kitchen, port, challenge]

export const ANIM_LESSONS: Lessons = Object.assign({}, ...ISLANDS.map(i => i.lessons))
export const HELP: Helps = Object.assign({}, ...ISLANDS.map(i => i.help))

/** Levels whose lesson is animated, so the pictures and sounds carry it without words. */
export const hasAnimLesson = (kind: LevelKind) => kind in ANIM_LESSONS
export const hasHelp = (kind: QuizKind) => kind in HELP
