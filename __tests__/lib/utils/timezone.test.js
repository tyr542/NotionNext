import { zonedDateTimeToUtcMs } from '@/lib/utils/timezone'

describe('zonedDateTimeToUtcMs', () => {
  it('handles daylight saving time for America/New_York', () => {
    const timestamp = zonedDateTimeToUtcMs(
      '2026-06-01',
      '00:00',
      'America/New_York'
    )

    expect(new Date(timestamp).toISOString()).toBe('2026-06-01T04:00:00.000Z')
  })

  it('keeps fixed-offset zones stable', () => {
    const timestamp = zonedDateTimeToUtcMs(
      '2026-06-01',
      '00:00',
      'Asia/Taipei'
    )

    expect(new Date(timestamp).toISOString()).toBe('2026-05-31T16:00:00.000Z')
  })
})
