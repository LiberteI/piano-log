import { useEffect, useState } from 'react'
import { CalendarSearch, Clock3, Eye, Pencil } from 'lucide-react'
import './history.css'

type PracticeLog = {
  practiceDate: string
  practiceTime: {
    hours: number
    minutes: number
  }
  fundamentals: Array<{
    key: string | null
  }>
  pieces: Array<{
    name: string | null
  }>
  reflection: {
    todaysWin: string | null
    tomorrowsFocus: string | null
  } | null
}

type HistoryCardProps = {
  number: string
  date: {
    iso: string
    month: string
    year: number
    dayOfMonth: string
  }
  practiceItem: string
  practiceTime: string
  reflections: string
}

export function HistoryCard({ number, date, practiceItem, practiceTime, reflections }: HistoryCardProps) {
  return (
    <article className='history-card'>
      <header className='history-card-date'>
        <time dateTime={date.iso}>
          <strong>{number}</strong>
          <span>{date.month}</span>
          <small>{date.year}</small>
        </time>
        <p>{date.dayOfMonth}</p>
      </header>

      <div className='history-card-line' aria-hidden='true' />

      <div className='history-card-content'>
        <h2>{practiceItem}</h2>
        <p className='history-card-time'><Clock3 aria-hidden='true' size={16} /> {practiceTime}</p>
        <p className='history-card-reflection'>{reflections}</p>

        <footer className='history-card-actions'>
          <button type='button'><Eye aria-hidden='true' size={16} /> View</button>
          <button type='button'><Pencil aria-hidden='true' size={16} /> Edit</button>
        </footer>
      </div>
    </article>
  )
}

function History() {
  const [logs, setLogs] = useState<PracticeLog[] | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadLogs() {
      try {
        const response = await fetch('/api/logs')

        if (!response.ok) {
          throw new Error('Unable to load practice history.')
        }

        const records = await response.json() as PracticeLog[]

        if (isCurrent) {
          setLogs(records)
        }
      } catch {
        if (isCurrent) {
          setLogs([])
        }
      }
    }

    void loadLogs()

    return () => {
      isCurrent = false
    }
  }, [])

  const isEmpty = logs === null || logs.length === 0

  return (
    <section className='history-page' aria-labelledby='history-heading'>
      <header className='history-header'>
        <span aria-hidden='true'>|</span>
        <h1 id='history-heading'>History</h1>
      </header>

      {isEmpty ? (
        <div className='history-empty'>
          <CalendarSearch aria-hidden='true' size={28} />
          <h2>Your practice history will appear here.</h2>
          <p>Save a log from the Logger page to begin building your archive.</p>
          <div><Clock3 aria-hidden='true' size={16} /> Each entry is grouped by practice date.</div>
        </div>
      ) : (
        <div className='history-list'>
          {logs.map((log, index) => {
            const date = new globalThis.Date(`${log.practiceDate}T12:00:00`)
            const practiceItem = [
              ...log.fundamentals.map((item) => item.key),
              ...log.pieces.map((item) => item.name),
            ].filter((item): item is string => Boolean(item)).join(' · ') || 'Practice session'
            const reflection = log.reflection?.todaysWin ?? log.reflection?.tomorrowsFocus ?? 'No reflection recorded.'

            return (
              <HistoryCard
                key={log.practiceDate}
                number={String(logs.length - index)}
                date={{
                  iso: log.practiceDate,
                  month: date.toLocaleString('en-US', { month: 'short' }),
                  year: date.getFullYear(),
                  dayOfMonth: formatOrdinal(date.getDate()),
                }}
                practiceItem={practiceItem}
                practiceTime={`${log.practiceTime.hours} hr ${log.practiceTime.minutes} min`}
                reflections={reflection}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

function formatOrdinal(day: number) {
  const remainder = day % 100
  if (remainder === 11 || remainder === 12 || remainder === 13) return `${day}th`

  switch (day % 10) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

export default History
