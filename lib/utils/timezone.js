function formatPartsToObject(parts) {
  return parts.reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = Number(part.value)
    }
    return acc
  }, {})
}

function getZonedParts(timestamp, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  })

  return formatPartsToObject(formatter.formatToParts(new Date(timestamp)))
}

export function zonedDateTimeToUtcMs(
  date,
  time = '00:00',
  timeZone = 'UTC'
) {
  const [year, month, day] = String(date).split('-').map(Number)
  const [hour = 0, minute = 0, second = 0] = String(
    `${time}:00`
  ).split(':').map(Number)

  const targetUtcMs = Date.UTC(year, month - 1, day, hour, minute, second)
  let guess = targetUtcMs

  for (let i = 0; i < 4; i++) {
    const zoned = getZonedParts(guess, timeZone)
    const zonedUtcMs = Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute,
      zoned.second
    )
    const diff = targetUtcMs - zonedUtcMs

    if (diff === 0) {
      return guess
    }

    guess += diff
  }

  return guess
}
