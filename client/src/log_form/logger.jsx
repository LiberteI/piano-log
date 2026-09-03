import { useState } from 'react'
import { ArrowRight, CalendarDays, Clock3, Goal, ListMusic, Music2, Save, Trash2, Trophy } from 'lucide-react'
import './logger.css'

const optionalString = (formData, name) => {
  const value = formData.get(name)?.toString().trim()
  return value || null
}

const optionalNumber = (formData, name) => {
  const value = optionalString(formData, name)
  return value === null ? null : Number(value)
}

const hasValues = (entry) => Object.values(entry).some((value) => value !== null)

const PieceCard = ({ id, onDelete }) => {
  return (
    <div className='logger-dynamic-card'>
      <div className='logger-piece-fields'>
        <div className='logger-field'>
          <label htmlFor={`piece-${id}-name`}>Piece Name / No.</label>
          <input id={`piece-${id}-name`} name={`piece-${id}-name`} type="text" />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-bpm`}>BPM</label>
          <input id={`piece-${id}-bpm`} name={`piece-${id}-bpm`} type="number" min='1' />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-time`}>Time of Focus</label>
          <input id={`piece-${id}-time`} name={`piece-${id}-time`} type="number" min='1' />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-problem`}>Problem</label>
          <input id={`piece-${id}-problem`} name={`piece-${id}-problem`} type="text" />
        </div>
      </div>

      <button className='logger-delete-button' type='button' onClick={() => onDelete(id)}>
        <Trash2 aria-hidden='true' size={16} /> Delete Piece
      </button>
    </div>
  )
}

const FundamentalCard = ({ id, onDelete }) => {
  return (
    <div className='logger-dynamic-card logger-fundamental-card'>
      <div className='logger-piece-fields'>
        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-key`}>Key</label>
          <input id={`fundamental-${id}-key`} name={`fundamental-${id}-key`} type="text" />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-bpm`}>BPM</label>
          <input id={`fundamental-${id}-bpm`} name={`fundamental-${id}-bpm`} type="number" min='1' />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-time`}>Time of Focus</label>
          <input id={`fundamental-${id}-time`} name={`fundamental-${id}-time`} type="number" min='1' />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-problem`}>Problem</label>
          <input id={`fundamental-${id}-problem`} name={`fundamental-${id}-problem`} type="text" />
        </div>
      </div>

      <button className='logger-delete-button' type='button' onClick={() => onDelete(id)}>
        <Trash2 aria-hidden='true' color='#f2b53d' size={16} /> Delete Item
      </button>
    </div>
  )
}

const FundamentalForm = ({ items, onAdd, onDelete }) => {
  return (
    <div>
      <h2><ListMusic aria-hidden='true' color='#f2b53d' size={18} /> Fundamentals</h2>
      <button className='logger-add-button' type='button' onClick={onAdd}>+ Add New Item</button>
      {items.map((id) => <FundamentalCard key={id} id={id} onDelete={onDelete} />)}
    </div>
  )
} 

const PieceForm = ({ pieces, onAdd, onDelete }) => {
  return (
    <div>
      <h2><Music2 aria-hidden='true' color='#f2b53d' size={18} /> Practice Pieces</h2>
      <button className='logger-add-button' type='button' onClick={onAdd}>+ Add New Piece</button>
      {pieces.map((id) => <PieceCard key={id} id={id} onDelete={onDelete} />)}
    </div>
  )
}

const ReflectionForm = (type) => {
  return (
    <div>
      <h2><Trophy aria-hidden='true' color='#f2b53d' size={18} /> Today's Win</h2>
      <textarea name='todaysWin' aria-label="Today's win" placeholder="One thing that was better than last time" />
      
      <h2><Goal aria-hidden='true' color='#f2b53d' size={18} /> Tomorrow's Focus</h2>
      <textarea name='tomorrowsFocus' aria-label="Tomorrow's focus" placeholder="What will you work on next?" />
    </div>
  )
}

const PracticeDate = ({ maxDate }) => {
  return (
    <div className='logger-field'>
      <label htmlFor="practice-date"><CalendarDays aria-hidden='true' color='#f2b53d' size={18} /> Practice Date</label>
      <input id="practice-date" name='practiceDate' type="date" max={maxDate} required />
    </div>
  )
}

const PracticeTime = () => {
  const hours = Array.from({ length: 13 }, (_, hour) => hour)
  const minutes = Array.from({ length: 60 }, (_, minute) => minute)

  return (
    <div className='logger-field'>
      <label htmlFor="practice-hours"><Clock3 aria-hidden='true' color='#f2b53d' size={18} /> Total Practice Time</label>
      <div className='logger-duration-selects'>
        <select id='practice-hours' name='practiceHours' aria-label='Practice hours' defaultValue='' required>
          <option value='' disabled>Hours</option>
          {hours.map((hour) => <option key={hour} value={hour}>{hour} hr</option>)}
        </select>
        <select id='practice-minutes' name='practiceMinutes' aria-label='Practice minutes' defaultValue='' required>
          <option value='' disabled>Minutes</option>
          {minutes.map((minute) => <option key={minute} value={minute}>{minute} min</option>)}
        </select>
      </div>
    </div>
  )
}

const ActionButtons = ({ isSaving }) => {
  return (
    <button className='logger-save-button' type='submit' disabled={isSaving}>
      <Save aria-hidden='true' size={16} /> {isSaving ? 'Saving...' : 'Save Log'} <ArrowRight aria-hidden='true' size={16} />
    </button>
  )
}

function Logger() {
  const [fundamentalItems, setFundamentalItems] = useState([])
  const [pieces, setPieces] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState('')
  const currentDate = new Date()
  const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`

  function addFundamentalItem() {
    setFundamentalItems((items) => [...items, crypto.randomUUID()])
  }

  function addPiece() {
    setPieces((items) => [...items, crypto.randomUUID()])
  }

  function deleteFundamentalItem(id) {
    setFundamentalItems((items) => items.filter((itemId) => itemId !== id))
  }

  function deletePiece(id) {
    setPieces((items) => items.filter((pieceId) => pieceId !== id))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const fundamentals = fundamentalItems.map((id) => ({
      key: optionalString(formData, `fundamental-${id}-key`),
      bpm: optionalNumber(formData, `fundamental-${id}-bpm`),
      timeOfFocusMinutes: optionalNumber(formData, `fundamental-${id}-time`),
      problem: optionalString(formData, `fundamental-${id}-problem`),
    })).filter(hasValues)
    const loggedPieces = pieces.map((id) => ({
      name: optionalString(formData, `piece-${id}-name`),
      bpm: optionalNumber(formData, `piece-${id}-bpm`),
      timeOfFocusMinutes: optionalNumber(formData, `piece-${id}-time`),
      problem: optionalString(formData, `piece-${id}-problem`),
    })).filter(hasValues)
    const reflection = {
      todaysWin: optionalString(formData, 'todaysWin'),
      tomorrowsFocus: optionalString(formData, 'tomorrowsFocus'),
    }
    const payload = {
      practiceDate: formData.get('practiceDate'),
      practiceTime: {
        hours: Number(formData.get('practiceHours')),
        minutes: Number(formData.get('practiceMinutes')),
      },
      fundamentals,
      pieces: loggedPieces,
      reflection: hasValues(reflection) ? reflection : null,
    }

    setIsSaving(true)
    setSubmissionMessage('')

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.status === 409) {
        setSubmissionMessage('A log already exists for this practice date.')
        return
      }

      if (!response.ok) {
        throw new Error('Unable to save the practice log.')
      }

      setSubmissionMessage('Practice log saved.')
    } catch (error) {
      setSubmissionMessage(error instanceof Error ? error.message : 'Unable to save the practice log.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='logger-page'>
      <header className='logger-header'>
        <span aria-hidden='true'>|</span>
        <h1>Piano Logger</h1>
      </header>

      <form className='logger-card' onSubmit={handleSubmit}>
        <div className='logger-session-fields'>
          <PracticeDate maxDate={today} />
          <PracticeTime />
        </div>

        <FundamentalForm items={fundamentalItems} onAdd={addFundamentalItem} onDelete={deleteFundamentalItem} />

        <PieceForm pieces={pieces} onAdd={addPiece} onDelete={deletePiece} />

        <ReflectionForm />

        <ActionButtons isSaving={isSaving} />
        {submissionMessage && <p className='logger-submission-message' role='status'>{submissionMessage}</p>}
      </form>
    </div>
  )
}

export default Logger
