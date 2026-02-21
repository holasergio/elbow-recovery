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

export async function exportAllData(): Promise<string> {
  const [rom, pain, sessions] = await Promise.all([
    exportROMData(), exportPainData(), exportSessionData()
  ])
  return `=== ROM ===\n${rom}\n\n=== \u0411\u041E\u041B\u042C ===\n${pain}\n\n=== \u0421\u0415\u0421\u0421\u0418\u0418 ===\n${sessions}`
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
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
