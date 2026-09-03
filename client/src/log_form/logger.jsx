import { useState } from 'react'
import { ArrowRight, CalendarDays, Clock3, Goal, ListMusic, Music2, Save, Trash2, Trophy } from 'lucide-react'
import './logger.css'

const PieceCard = ({ id, onDelete }) => {
  return (
    <div className='logger-dynamic-card'>
      <div className='logger-piece-fields'>
        <div className='logger-field'>
          <label htmlFor={`piece-${id}-name`}>Piece Name / No.</label>
          <input id={`piece-${id}-name`} type="text" />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-bpm`}>BPM</label>
          <input id={`piece-${id}-bpm`} type="text" />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-time`}>Time of Focus</label>
          <input id={`piece-${id}-time`} type="text" />
        </div>

        <div className='logger-field'>
          <label htmlFor={`piece-${id}-problem`}>Problem</label>
          <input id={`piece-${id}-problem`} type="text" />
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
          <input id={`fundamental-${id}-key`} type="text" />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-bpm`}>BPM</label>
          <input id={`fundamental-${id}-bpm`} type="text" />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-time`}>Time of Focus</label>
          <input id={`fundamental-${id}-time`} type="text" />
        </div>

        <div className='logger-field'>
          <label htmlFor={`fundamental-${id}-problem`}>Problem</label>
          <input id={`fundamental-${id}-problem`} type="text" />
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
      <textarea aria-label="Today's win" placeholder="One thing that was better than last time" />
      
      <h2><Goal aria-hidden='true' color='#f2b53d' size={18} /> Tomorrow's Focus</h2>
      <textarea aria-label="Tomorrow's focus" placeholder="What will you work on next?" />
    </div>
  )
}

const PracticeDate = ({ maxDate }) => {
  return (
    <div className='logger-field'>
      <label htmlFor="practice-date"><CalendarDays aria-hidden='true' color='#f2b53d' size={18} /> Practice Date</label>
      <input id="practice-date" type="date" max={maxDate} required />
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

const ActionButtons = () => {
  return (
    <button className='logger-save-button' type='submit'><Save aria-hidden='true' size={16} /> Save Log <ArrowRight aria-hidden='true' size={16} /></button>
  )
}

function Logger() {
  const [fundamentalItems, setFundamentalItems] = useState([])
  const [pieces, setPieces] = useState([])
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

  function handleSubmit(event) {
    event.preventDefault()
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

        <ActionButtons />
      </form>
    </div>
  )
}

export default Logger
