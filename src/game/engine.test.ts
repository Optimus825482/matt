import { describe, expect, it, vi } from 'vitest'
import {
  createInitialState,
  getAccuracy,
  getNextQuestion,
  getTimerLabel,
  gradeAnswer,
} from './engine'
import type { HistoryItem, Question } from './types'

describe('engine', () => {
  it('division mission always creates integer-answer division questions', () => {
    const questions = Array.from({ length: 25 }, () => getNextQuestion('division', 'focus', []))

    for (const question of questions) {
      expect(question.operation).toBe('division')
      expect(question.left % question.right).toBe(0)
    }
  })

  it('mixed mission avoids repeating the previous operation when alternatives exist', () => {
    const history: HistoryItem[] = [
      {
        questionId: '1',
        operation: 'multiplication',
        expectedAnswer: 12,
        givenAnswer: 12,
        isCorrect: true,
        points: 10,
        reactionSeconds: 3,
        feedback: { isCorrect: true, message: 'ok' },
      },
    ]

    const next = getNextQuestion('mixed', 'focus', history)
    expect(next.operation).not.toBe('multiplication')
  })

  it('grades a correct answer with points and feedback', () => {
    vi.setSystemTime(new Date('2026-04-21T10:00:05.000Z'))
    const question: Question = {
      id: 'q1',
      operation: 'multiplication',
      left: 7,
      right: 8,
      symbol: '×',
      answer: 56,
      prompt: 'test',
      createdAt: new Date('2026-04-21T10:00:00.000Z').getTime(),
    }

    const result = gradeAnswer(question, 56)
    expect(result.isCorrect).toBe(true)
    expect(result.points).toBeGreaterThan(0)
    expect(result.feedback.isCorrect).toBe(true)
  })

  it('computes accuracy and timer labels cleanly', () => {
    expect(getAccuracy([])).toBe(100)
    expect(
      getAccuracy([
        {
          questionId: '1',
          operation: 'addition',
          expectedAnswer: 5,
          givenAnswer: 5,
          isCorrect: true,
          points: 12,
          reactionSeconds: 2,
          feedback: { isCorrect: true, message: 'ok' },
        },
        {
          questionId: '2',
          operation: 'division',
          expectedAnswer: 4,
          givenAnswer: 2,
          isCorrect: false,
          points: 0,
          reactionSeconds: 4,
          feedback: { isCorrect: false, message: 'no' },
        },
      ]),
    ).toBe(50)
    expect(getTimerLabel(61)).toBe('01:01')
  })

  it('creates a ready-to-play session with the selected timer', () => {
    const state = createInitialState('tables', 'boost')
    expect(state.missionId).toBe('tables')
    expect(state.remainingSeconds).toBe(45)
    expect(state.status).toBe('playing')
  })
})
