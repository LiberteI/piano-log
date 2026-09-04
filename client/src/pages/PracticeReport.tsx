import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarSearch, Clock3, MoreHorizontal, Pencil, Trash2, Trophy, Goal } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiUrl } from '../api.ts'
import './practice-report.css'

type Fundamental = {
  types?: string[] | null
  key: string | null
  bpm: number | null
  timeOfFocusMinutes: number | null
  problem: string | null
}

type Piece = {
  name: string | null
  bpm: number | null
  timeOfFocusMinutes: number | null
  problem: string | null
  category?: string | null
  techniqueFocus?: string | null
  sectionPracticed?: string | null
  note?: string | null
}

type PracticeLog = {
  practiceDate: string
  practiceTime: { hours: number; minutes: number }
  fundamentals: Fundamental[]
  pieces: Piece[]
  reflection: { todaysWin: string | null; tomorrowsFocus: string | null } | null
}

const pieceCategories = ['Hanon', 'Etude', 'Repertoire']

function PracticeReport() {
  const { practiceDate } = useParams()
  const navigate = useNavigate()
  const [log, setLog] = useState<PracticeLog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const dateKey = practiceDate ?? ''
    if (!dateKey) return
    let isCurrent = true

    async function loadLog() {
      try {
        const response = await fetch(apiUrl(`/api/logs/${encodeURIComponent(dateKey)}`))
        if (!response.ok) throw new Error(response.status === 404 ? 'This practice log no longer exists.' : 'Unable to load this practice log.')
        const record = await response.json() as PracticeLog
        if (isCurrent) setLog(record)
      } catch (error) {
        if (isCurrent) setMessage(error instanceof TypeError ? 'Unable to reach the API. Start the PianoLog.Api server and try again.' : error instanceof Error ? error.message : 'Unable to load this practice log.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadLog()
    return () => { isCurrent = false }
  }, [practiceDate])

  async function deleteLog() {
    if (!practiceDate || !window.confirm('Delete this practice log? This cannot be undone.')) return

    try {
      const response = await fetch(apiUrl(`/api/logs/${encodeURIComponent(practiceDate)}`), { method: 'DELETE' })
      if (!response.ok) throw new Error('Unable to delete this practice log.')
      navigate('/history')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete this practice log.')
      setIsMenuOpen(false)
    }
  }

  if (isLoading) return <section className='practice-report-state'>Loading practice report...</section>
  if (!log) return <section className='practice-report-state'><CalendarSearch aria-hidden='true' size={28} /><p>{message || 'Practice log not found.'}</p><Link to='/history'>Back to History</Link></section>

  const date = new globalThis.Date(`${log.practiceDate}T12:00:00`)
  const fundamentals = log.fundamentals ?? []
  const techniques = [...new Set(fundamentals.flatMap((item) => item.types ?? []))]
  const categoryGroups: Array<[string, Piece[]]> = pieceCategories
    .map((category) => [category, log.pieces.filter((piece) => piece.category === category)] as [string, Piece[]])
    .filter(([, pieces]) => pieces.length > 0)
  const uncategorizedPieces = log.pieces.filter((piece) => !piece.category)
  if (uncategorizedPieces.length > 0) categoryGroups.push(['Practice Pieces', uncategorizedPieces])

  return (
    <article className='practice-report'>
      <header className='practice-report-header'>
        <Link className='practice-report-back' to='/history'><ArrowLeft aria-hidden='true' size={16} /> Back to History</Link>
        <div className='practice-report-menu'>
          <button type='button' aria-label='Practice log actions' aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)}><MoreHorizontal aria-hidden='true' size={20} /></button>
          {isMenuOpen && (
            <div className='practice-report-menu-options'>
              <button type='button' onClick={() => navigate(`/?edit=${encodeURIComponent(log.practiceDate)}`)}><Pencil aria-hidden='true' size={15} /> Edit log</button>
              <button type='button' onClick={deleteLog}><Trash2 aria-hidden='true' size={15} /> Delete log</button>
            </div>
          )}
        </div>
      </header>

      <div className='practice-report-heading'>
        <p>{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div><h1>Practice Session</h1><span><Clock3 aria-hidden='true' size={16} /> {formatDuration(log.practiceTime)}</span></div>
      </div>

      <section className='practice-report-section'>
        <h2>Fundamentals</h2>
        {techniques.length > 0 && <div className='practice-report-tags'>{techniques.map((technique) => <span key={technique}>{technique}</span>)}</div>}
        {fundamentals.length > 0 ? fundamentals.map((item, index) => <FundamentalEntry key={`${item.key}-${index}`} item={item} />) : <p className='practice-report-muted'>No fundamentals recorded.</p>}
      </section>

      {categoryGroups.map(([category, pieces]) => (
        <section className='practice-report-section' key={category}>
          <h2>{category}</h2>
          {pieces.map((piece, index) => <PieceEntry key={`${piece.name}-${index}`} piece={piece} />)}
        </section>
      ))}

      <section className='practice-report-reflections'>
        <div><h2><Trophy aria-hidden='true' size={18} /> Today's Win</h2><p>{log.reflection?.todaysWin || 'No reflection recorded.'}</p></div>
        <div><h2><Goal aria-hidden='true' size={18} /> Tomorrow's Focus</h2><p>{log.reflection?.tomorrowsFocus || 'No focus recorded.'}</p></div>
      </section>

      {message && <p className='practice-report-message' role='status'>{message}</p>}
      <footer className='practice-report-footer'>
        <button type='button' onClick={() => navigate(`/?edit=${encodeURIComponent(log.practiceDate)}`)}><Pencil aria-hidden='true' size={16} /> Edit Log <ArrowRight aria-hidden='true' size={16} /></button>
      </footer>
    </article>
  )
}

function FundamentalEntry({ item }: { item: Fundamental }) {
  return <div className='practice-report-entry'>
    <div className='practice-report-metrics'>
      <Metric label='Key' value={item.key} />
      <Metric label='BPM' value={item.bpm?.toString() ?? null} />
      <Metric label='Time' value={item.timeOfFocusMinutes ? `${item.timeOfFocusMinutes} min` : null} />
    </div>
    {item.problem && <Detail label='Problem' value={item.problem} />}
  </div>
}

function PieceEntry({ piece }: { piece: Piece }) {
  return <div className='practice-report-entry'>
    <div className='practice-report-piece-title'><h3>{piece.name || 'Untitled piece'}</h3>{piece.timeOfFocusMinutes && <span>{piece.timeOfFocusMinutes} min</span>}</div>
    <div className='practice-report-metrics'>
      <Metric label='BPM' value={piece.bpm?.toString() ?? null} />
      <Metric label='Technique Focus' value={piece.techniqueFocus} />
      <Metric label='Section Practiced' value={piece.sectionPracticed} />
    </div>
    {piece.problem && <Detail label='Problem' value={piece.problem} />}
    {piece.note && <Detail label='Notes' value={piece.note} />}
  </div>
}

function Metric({ label, value }: { label: string; value: string | null | undefined }) {
  return value ? <div><span>{label}</span><strong>{value}</strong></div> : null
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className='practice-report-detail'><span>{label}</span><p>{value}</p></div>
}

function formatDuration(time: PracticeLog['practiceTime']) {
  return `${time.hours}h ${String(time.minutes).padStart(2, '0')}m`
}

export default PracticeReport
