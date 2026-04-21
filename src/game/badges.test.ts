import { describe, expect, it } from 'vitest'
import { getAchievementDefinitions } from './engine'

describe('achievement definitions', () => {
  it('contains the expected core badges', () => {
    const codes = getAchievementDefinitions().map((item) => item.code)
    expect(codes).toContain('first-session')
    expect(codes).toContain('streak-5')
    expect(codes).toContain('division-master')
    expect(codes).toContain('accuracy-90')
  })
})
