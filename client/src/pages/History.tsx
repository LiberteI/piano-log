import { CalendarSearch, Clock3 } from 'lucide-react'
import './history.css'

function History() {
  return (
    <section className='history-page' aria-labelledby='history-heading'>
      <header className='history-header'>
        <p>Practice archive</p>
        <h1 id='history-heading'>History</h1>
        <span>Review saved practice days and their notes.</span>
      </header>

      <div className='history-empty'>
        <CalendarSearch aria-hidden='true' size={28} />
        <h2>Your practice history will appear here.</h2>
        <p>Save a log from the Logger page to begin building your archive.</p>
        <div><Clock3 aria-hidden='true' size={16} /> Each entry is grouped by practice date.</div>
      </div>
    </section>
  )
}

export default History
