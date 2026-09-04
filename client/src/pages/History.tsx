import { useEffect, useRef, useState } from 'react'
import { CalendarDays, CalendarSearch, ChevronLeft, ChevronRight, Clock3, Eye, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
  onEdit: () => void
}

type HistoryFilter = 'all' | 'this-month' | 'last-three-months' | 'this-year' | 'month-specific'

export function HistoryCard({ number, date, practiceItem, practiceTime, reflections, onEdit }: HistoryCardProps) {
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
          <button type='button' onClick={onEdit}><Pencil aria-hidden='true' size={16} /> Edit</button>
        </footer>
      </div>
    </article>
  )
}

function History() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState<PracticeLog[] | null>(null)
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new globalThis.Date()))
  const monthInputRef = useRef<HTMLInputElement>(null)

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
  const filteredLogs = logs?.filter((log) => matchesFilter(log.practiceDate, filter, selectedMonth)) ?? []

  function changeMonth(offset: number) {
    setSelectedMonth((month) => new globalThis.Date(month.getFullYear(), month.getMonth() + offset, 1))
    setFilter('month-specific')
  }

  function openMonthPicker() {
    const input = monthInputRef.current
    if (!input) return

    input.showPicker?.()
    input.focus()
  }

  return (
    <section className='history-page' aria-labelledby='history-heading'>
      <header className='history-header'>
        <span aria-hidden='true'>|</span>
        <h1 id='history-heading'>History</h1>
      </header>

      {!isEmpty && (
        <div className='history-filters' aria-label='Filter practice history'>
          <div className='history-filter-options'>
            <button className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')} type='button'>All</button>
            <button className={filter === 'this-month' ? 'is-active' : ''} onClick={() => setFilter('this-month')} type='button'>This Month</button>
            <button className={filter === 'last-three-months' ? 'is-active' : ''} onClick={() => setFilter('last-three-months')} type='button'>Last 3 Months</button>
            <button className={filter === 'this-year' ? 'is-active' : ''} onClick={() => setFilter('this-year')} type='button'>This Year</button>
          </div>

          <div className={`history-month-picker ${filter === 'month-specific' ? 'is-active' : ''}`}>
            <button className='history-month-trigger' type='button' onClick={openMonthPicker} aria-pressed={filter === 'month-specific'}>
              <CalendarDays aria-hidden='true' size={16} />
              {selectedMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </button>
            <input
              ref={monthInputRef}
              className='history-month-input'
              type='month'
              value={formatMonthValue(selectedMonth)}
              onChange={(event) => {
                if (!event.target.value) return
                setSelectedMonth(new globalThis.Date(`${event.target.value}-01T12:00:00`))
                setFilter('month-specific')
              }}
              tabIndex={-1}
              aria-label='Choose practice month'
            />
            <div className='history-month-picker-arrows'>
              <button type='button' onClick={() => changeMonth(-1)} aria-label='Previous month'><ChevronLeft aria-hidden='true' size={16} /></button>
              <button type='button' onClick={() => changeMonth(1)} aria-label='Next month'><ChevronRight aria-hidden='true' size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {isEmpty ? (
        <div className='history-empty'>
          <CalendarSearch aria-hidden='true' size={28} />
          <h2>Your practice history will appear here.</h2>
          <p>Save a log from the Logger page to begin building your archive.</p>
          <div><Clock3 aria-hidden='true' size={16} /> Each entry is grouped by practice date.</div>
        </div>
      ) : (
        filteredLogs.length === 0 ? (
          <div className='history-filter-empty'>No practice logs match this period.</div>
        ) : (
          <div className='history-list'>
          {filteredLogs.map((log) => {
            const date = new globalThis.Date(`${log.practiceDate}T12:00:00`)
            const recordNumber = logs.length - logs.findIndex((record) => record.practiceDate === log.practiceDate)
            const practiceItem = [
              ...log.fundamentals.map((item) => item.key),
              ...log.pieces.map((item) => item.name),
            ].filter((item): item is string => Boolean(item)).join(' · ') || 'Practice session'
            const reflection = log.reflection?.todaysWin ?? log.reflection?.tomorrowsFocus ?? 'No reflection recorded.'

            return (
              <HistoryCard
                key={log.practiceDate}
                number={String(recordNumber)}
                date={{
                  iso: log.practiceDate,
                  month: date.toLocaleString('en-US', { month: 'short' }),
                  year: date.getFullYear(),
                  dayOfMonth: formatOrdinal(date.getDate()),
                }}
                practiceItem={practiceItem}
                practiceTime={`${log.practiceTime.hours} hr ${log.practiceTime.minutes} min`}
                reflections={reflection}
                onEdit={() => navigate(`/?edit=${encodeURIComponent(log.practiceDate)}`)}
              />
            )
          })}
          </div>
        )
      )}
    </section>
  )
}

function startOfMonth(date: Date) {
  return new globalThis.Date(date.getFullYear(), date.getMonth(), 1)
}

function formatMonthValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function matchesFilter(practiceDate: string, filter: HistoryFilter, selectedMonth: Date) {
  const date = new globalThis.Date(`${practiceDate}T12:00:00`)
  const currentMonth = startOfMonth(new globalThis.Date())

  switch (filter) {
    case 'this-month':
      return date.getFullYear() === currentMonth.getFullYear() && date.getMonth() === currentMonth.getMonth()
    case 'last-three-months': {
      const earliestMonth = new globalThis.Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1)
      return date >= earliestMonth && date <= new globalThis.Date()
    }
    case 'this-year':
      return date.getFullYear() === currentMonth.getFullYear()
    case 'month-specific':
      return date.getFullYear() === selectedMonth.getFullYear() && date.getMonth() === selectedMonth.getMonth()
    default:
      return true
  }
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
