import { db } from '@/lib/db'

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`
  return [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(','))
  ].join('\n')
}

export async function exportROMData(): Promise<string> {
  const data = await db.romMeasurements.orderBy('date').toArray()
  const headers = ['Дата', 'Сгибание\u00B0', 'Дефицит разгибания\u00B0', 'Дуга\u00B0', 'Пронация\u00B0', 'Супинация\u00B0', 'Кто измерял', 'Заметки']
  const rows = data.map(d => [
    d.date, String(d.flexion), String(d.extensionDeficit), String(d.arc),
    d.pronation != null ? String(d.pronation) : '', d.supination != null ? String(d.supination) : '',
    d.measuredBy === 'self' ? 'Самостоятельно' : 'Физиотерапевт', d.notes || ''
  ])
  return toCsv(headers, rows)
}

export async function exportPainData(): Promise<string> {
  const data = await db.painEntries.orderBy('date').toArray()
  const headers = ['Дата', 'Время', 'Уровень', 'Локализация', 'Характер', 'Триггеры', 'Крепитация', 'Онемение 4-5', 'Заметки']
  const rows = data.map(d => [
    d.date, d.time, String(d.level), d.locations.join('; '), d.character.join('; '),
    d.triggers.join('; '), d.crepitation, d.numbness45 ? 'Да' : 'Нет', d.notes || ''
  ])
  return toCsv(headers, rows)
}

export async function exportSessionData(): Promise<string> {
  const data = await db.exerciseSessions.orderBy('date').toArray()
  const headers = ['Дата', 'Упражнение', 'Сессия', 'Сеты', 'Повторения', 'Боль до', 'Боль после', 'Заметки']
  const rows = data.map(d => [
    d.date, d.exerciseId, String(d.sessionSlot), String(d.completedSets), String(d.completedReps),
    d.painBefore != null ? String(d.painBefore) : '', d.painAfter != null ? String(d.painAfter) : '', d.notes || ''
  ])
  return toCsv(headers, rows)
}

export async function exportSleepData(): Promise<string> {
  const data = await db.sleepLogs.orderBy('date').toArray()
  const headers = ['Дата', 'Отбой', 'Подъём', 'Часов', 'Качество (1-5)', 'Пробуждения', 'Заметки']
  const rows = data.map(d => [
    d.date, d.bedTime, d.wakeTime, String(d.totalHours),
    String(d.quality), String(d.wakeUps), d.notes || ''
  ])
  return toCsv(headers, rows)
}

export async function exportSupplementData(): Promise<string> {
  const data = await db.supplementLogs.orderBy('date').toArray()
  const headers = ['Дата', 'Добавка', 'Приём', 'Принято', 'Время', 'Причина пропуска']
  const rows = data.map(d => [
    d.date, d.supplementId, d.slot, d.taken ? 'Да' : 'Нет',
    d.takenAt || '', d.skippedReason || ''
  ])
  return toCsv(headers, rows)
}

export async function exportDailyLogData(): Promise<string> {
  const data = await db.dailyLogs.orderBy('date').toArray()
  const headers = ['Дата', 'Часов свисания', 'Мелкая моторика', 'Сессий', 'Заметки']
  const rows = data.map(d => [
    d.date, String(d.hangingHours), d.fineMotor.join('; '),
    String(d.sessionsCompleted), d.notes || ''
  ])
  return toCsv(headers, rows)
}

export async function exportAllData(): Promise<string> {
  const [rom, pain, sessions, sleep, supplements, daily] = await Promise.all([
    exportROMData(), exportPainData(), exportSessionData(),
    exportSleepData(), exportSupplementData(), exportDailyLogData()
  ])
  return [
    `=== ROM ===\n${rom}`,
    `=== \u0411\u041E\u041B\u042C ===\n${pain}`,
    `=== \u0421\u0415\u0421\u0421\u0418\u0418 ===\n${sessions}`,
    `=== \u0421\u041E\u041D ===\n${sleep}`,
    `=== \u0414\u041E\u0411\u0410\u0412\u041A\u0418 ===\n${supplements}`,
    `=== \u0414\u041D\u0415\u0412\u041D\u0418\u041A ===\n${daily}`,
  ].join('\n\n')
}

export async function exportAllDataJSON(): Promise<string> {
  const [rom, pain, sessions, sleep, supplements, dailyLogs] = await Promise.all([
    db.romMeasurements.toArray(),
    db.painEntries.toArray(),
    db.exerciseSessions.toArray(),
    db.sleepLogs.toArray(),
    db.supplementLogs.toArray(),
    db.dailyLogs.toArray(),
  ])
  return JSON.stringify(
    { rom, pain, sessions, sleep, supplements, dailyLogs, exportedAt: new Date().toISOString(), version: 1 },
    null,
    2
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripIds(items: any[]): any[] {
  return items.map(({ id, ...rest }) => rest)
}

export async function importAllDataJSON(
  jsonString: string
): Promise<{ imported: number; errors: string[] }> {
  const data = JSON.parse(jsonString)
  let imported = 0
  const errors: string[] = []

  if (!data.version || data.version !== 1) {
    throw new Error('Неподдерживаемый формат данных. Требуется version: 1')
  }

  const importTable = async (
    key: string,
    label: string,
    addFn: () => Promise<void>,
    count: number
  ) => {
    if (count > 0) {
      try {
        await addFn()
        imported += count
      } catch (err) {
        errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  await importTable('rom', 'ROM', async () => {
    await db.romMeasurements.bulkAdd(stripIds(data.rom))
  }, data.rom?.length ?? 0)

  await importTable('pain', 'Боль', async () => {
    await db.painEntries.bulkAdd(stripIds(data.pain))
  }, data.pain?.length ?? 0)

  await importTable('sessions', 'Сессии', async () => {
    await db.exerciseSessions.bulkAdd(stripIds(data.sessions))
  }, data.sessions?.length ?? 0)

  await importTable('sleep', 'Сон', async () => {
    await db.sleepLogs.bulkAdd(stripIds(data.sleep))
  }, data.sleep?.length ?? 0)

  await importTable('supplements', 'Добавки', async () => {
    await db.supplementLogs.bulkAdd(stripIds(data.supplements))
  }, data.supplements?.length ?? 0)

  await importTable('dailyLogs', 'Дневник', async () => {
    await db.dailyLogs.bulkAdd(stripIds(data.dailyLogs))
  }, data.dailyLogs?.length ?? 0)

  return { imported, errors }
}

export function downloadFile(content: string, filename: string, type?: string) {
  const mimeType = type || 'text/csv;charset=utf-8;'
  const bom = type === 'application/json' ? '' : '\ufeff'
  const blob = new Blob([bom + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function shareData(content: string, filename: string) {
  if (navigator.share) {
    const file = new File(['\ufeff' + content], filename, { type: 'text/csv' })
    try {
      await navigator.share({ files: [file], title: 'Elbow Recovery \u2014 \u0414\u0430\u043D\u043D\u044B\u0435' })
      return true
    } catch { return false }
  }
  downloadFile(content, filename)
  return true
}
