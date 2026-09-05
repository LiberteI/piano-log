import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../api.ts'
import { ArrowRight, CalendarDays, ChevronDown, Clock3, Goal, ListMusic, Music2, Save, Trash2, Trophy } from 'lucide-react'
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

const fundamentalOptions = [
  'Scales',
  'Arpeggios',
  'Chords',
  'Octaves',
  'Jumps',
  'Rotation',
  'Voicing',
  'Repeated Notes',
  'Double Notes',
  'Hand Synchronization',
  'Polyphonic Control',
]

const PieceCard = ({ item, onDelete }) => {
  const { id } = item

  return (
    <div className='logger-dynamic-card'>
      <div className='logger-piece-fields'>
        <div className='logger-field'>
          <label htmlFor={`piece-${id}-name`}>Piece Name / No.</label>
          <input id={`piece-${id}-name`} name={`piece-${id}-name`} type="text" defaultValue={item.name ?? ''} />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-bpm`}>BPM</label>
          <input id={`piece-${id}-bpm`} name={`piece-${id}-bpm`} type="number" min='1' defaultValue={item.bpm ?? ''} />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-time`}>Time of Focus</label>
          <input id={`piece-${id}-time`} name={`piece-${id}-time`} type="number" min='1' defaultValue={item.timeOfFocusMinutes ?? ''} />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-problem`}>Problem</label>
          <input id={`piece-${id}-problem`} name={`piece-${id}-problem`} type="text" defaultValue={item.problem ?? ''} />
        </div>
      </div>

      <button className='logger-delete-button' type='button' onClick={() => onDelete(id)}>
        <Trash2 aria-hidden='true' size={16} /> Delete Piece
      </button>
    </div>
  )
}

const FundamentalCard = ({ item, onDelete }) => {
  const { id } = item
  const title = item.type ?? item.types?.[0] ?? 'Fundamental'

  return (
    <div className='logger-dynamic-card logger-fundamental-card'>
      <h3 className='logger-fundamental-title'>{title}</h3>
      <div className='logger-piece-fields'>
        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-key`}>Key</label>
          <input id={`fundamental-${id}-key`} name={`fundamental-${id}-key`} type="text" defaultValue={item.key ?? ''} />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-bpm`}>BPM</label>
          <input id={`fundamental-${id}-bpm`} name={`fundamental-${id}-bpm`} type="number" min='1' defaultValue={item.bpm ?? ''} />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-time`}>Time of Focus</label>
          <input id={`fundamental-${id}-time`} name={`fundamental-${id}-time`} type="number" min='1' defaultValue={item.timeOfFocusMinutes ?? ''} />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-problem`}>Problem</label>
          <input id={`fundamental-${id}-problem`} name={`fundamental-${id}-problem`} type="text" defaultValue={item.problem ?? ''} />
        </div>
      </div>

      <button className='logger-delete-button' type='button' onClick={() => onDelete(id)}>
        <Trash2 aria-hidden='true' color='#f2b53d' size={16} /> Delete Item
      </button>
    </div>
  )
}

const FundamentalForm = ({ items, onAdd, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <h2><ListMusic aria-hidden='true' color='#f2b53d' size={18} /> Fundamentals</h2>
      <div className='logger-add-menu'>
        <button className='logger-add-button' type='button' onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
          <ChevronDown aria-hidden='true' size={16} /> Add New Item
        </button>
        {isOpen && (
          <div className='logger-add-menu-options'>
            {fundamentalOptions.map((option) => (
              <button key={option} type='button' onClick={() => {
                onAdd(option)
                setIsOpen(false)
              }}>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      {items.map((item) => <FundamentalCard key={item.id} item={item} onDelete={onDelete} />)}
    </div>
  )
} 

const PieceForm = ({ pieces, onAdd, onDelete }) => {
  return (
    <div>
      <h2><Music2 aria-hidden='true' color='#f2b53d' size={18} /> Practice Pieces</h2>
      <button className='logger-add-button' type='button' onClick={onAdd}>+ Add New Piece</button>
      {pieces.map((item) => <PieceCard key={item.id} item={item} onDelete={onDelete} />)}
    </div>
  )
}

const ReflectionForm = ({ reflection }) => {
  return (
    <div>
      <h2><Trophy aria-hidden='true' color='#f2b53d' size={18} /> Today's Win</h2>
      <textarea name='todaysWin' aria-label="Today's win" placeholder="One thing that was better than last time" defaultValue={reflection?.todaysWin ?? ''} />
      
      <h2><Goal aria-hidden='true' color='#f2b53d' size={18} /> Tomorrow's Focus</h2>
      <textarea name='tomorrowsFocus' aria-label="Tomorrow's focus" placeholder="What will you work on next?" defaultValue={reflection?.tomorrowsFocus ?? ''} />
    </div>
  )
}

const PracticeDate = ({ maxDate, value }) => {
  return (
    <div className='logger-field'>
      <label htmlFor="practice-date"><CalendarDays aria-hidden='true' color='#f2b53d' size={18} /> Practice Date</label>
      <input id="practice-date" name='practiceDate' type="date" max={maxDate} defaultValue={value ?? ''} required />
    </div>
  )
}

const PracticeTime = ({ value }) => {
  const hours = Array.from({ length: 13 }, (_, hour) => hour)
  const minutes = Array.from({ length: 60 }, (_, minute) => minute)

  return (
    <div className='logger-field'>
      <label htmlFor="practice-hours"><Clock3 aria-hidden='true' color='#f2b53d' size={18} /> Total Practice Time</label>
      <div className='logger-duration-selects'>
        <select id='practice-hours' name='practiceHours' aria-label='Practice hours' defaultValue={value?.hours ?? ''} required>
          <option value='' disabled>Hours</option>
          {hours.map((hour) => <option key={hour} value={hour}>{hour} hr</option>)}
        </select>
        <select id='practice-minutes' name='practiceMinutes' aria-label='Practice minutes' defaultValue={value?.minutes ?? ''} required>
          <option value='' disabled>Minutes</option>
          {minutes.map((minute) => <option key={minute} value={minute}>{minute} min</option>)}
        </select>
      </div>
    </div>
  )
}

const ActionButtons = ({ isSaving, isEditing }) => {
  return (
    <button className='logger-save-button' type='submit' disabled={isSaving}>
      <Save aria-hidden='true' size={16} /> {isSaving ? 'Saving...' : isEditing ? 'Update Log' : 'Save Log'} <ArrowRight aria-hidden='true' size={16} />
    </button>
  )
}

function Logger() {
  const [searchParams] = useSearchParams()
  const editingDate = searchParams.get('edit')
  const [fundamentalItems, setFundamentalItems] = useState([])
  const [pieces, setPieces] = useState([])
  const [initialLog, setInitialLog] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const [isLoadingLog, setIsLoadingLog] = useState(Boolean(editingDate))
  const [isSaving, setIsSaving] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState('')
  const currentDate = new Date()
  const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`

  useEffect(() => {
    if (!editingDate) return

    let isCurrent = true

    async function loadLog() {
      try {
        const response = await apiFetch(`/api/logs/${encodeURIComponent(editingDate)}`)
        if (!response.ok) throw new Error('Unable to load this practice log.')

        const log = await response.json()
        if (!isCurrent) return

        setInitialLog(log)
        setFundamentalItems((log.fundamentals ?? []).map((item) => ({ ...item, id: crypto.randomUUID() })))
        setPieces((log.pieces ?? []).map((item) => ({ ...item, id: crypto.randomUUID() })))
        setFormKey((key) => key + 1)
      } catch (error) {
        if (isCurrent) {
          setSubmissionMessage(
            error instanceof TypeError
              ? 'Unable to reach the API. Start the PianoLog.Api server and try again.'
              : error instanceof Error ? error.message : 'Unable to load this practice log.',
          )
        }
      } finally {
        if (isCurrent) setIsLoadingLog(false)
      }
    }

    void loadLog()

    return () => {
      isCurrent = false
    }
  }, [editingDate])

  function addFundamentalItem(type) {
    setFundamentalItems((items) => [...items, { id: crypto.randomUUID(), type }])
  }

  function addPiece() {
    setPieces((items) => [...items, { id: crypto.randomUUID() }])
  }

  function deleteFundamentalItem(id) {
    setFundamentalItems((items) => items.filter((item) => item.id !== id))
  }

  function deletePiece(id) {
    setPieces((items) => items.filter((piece) => piece.id !== id))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const fundamentals = fundamentalItems.map((item) => ({
      key: optionalString(formData, `fundamental-${item.id}-key`),
      bpm: optionalNumber(formData, `fundamental-${item.id}-bpm`),
      timeOfFocusMinutes: optionalNumber(formData, `fundamental-${item.id}-time`),
      problem: optionalString(formData, `fundamental-${item.id}-problem`),
      types: item.type ? [item.type] : item.types ?? null,
    })).filter(hasValues)
    const loggedPieces = pieces.map((item) => ({
      name: optionalString(formData, `piece-${item.id}-name`),
      bpm: optionalNumber(formData, `piece-${item.id}-bpm`),
      timeOfFocusMinutes: optionalNumber(formData, `piece-${item.id}-time`),
      problem: optionalString(formData, `piece-${item.id}-problem`),
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
      const response = await apiFetch(editingDate ? `/api/logs/${encodeURIComponent(editingDate)}` : '/api/logs', {
        method: editingDate ? 'PUT' : 'POST',
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

      setSubmissionMessage(editingDate ? 'Practice log updated.' : 'Practice log saved.')
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

      <form key={formKey} className='logger-card' onSubmit={handleSubmit}>
        <div className='logger-session-fields'>
          <PracticeDate maxDate={today} value={initialLog?.practiceDate} />
          <PracticeTime value={initialLog?.practiceTime} />
        </div>

        <FundamentalForm items={fundamentalItems} onAdd={addFundamentalItem} onDelete={deleteFundamentalItem} />

        <PieceForm pieces={pieces} onAdd={addPiece} onDelete={deletePiece} />

        <ReflectionForm reflection={initialLog?.reflection} />

        <ActionButtons isSaving={isSaving} isEditing={Boolean(editingDate)} />
        {submissionMessage && <p className='logger-submission-message' role='status'>{submissionMessage}</p>}
      </form>
    </div>
  )
}

export default Logger
