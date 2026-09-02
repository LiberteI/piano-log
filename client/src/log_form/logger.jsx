import { useState } from 'react'
import { ArrowRight, CalendarDays, Clock3, Goal, ListMusic, Music2, Save, Trophy } from 'lucide-react'
import './logger.css'

const PieceCard = (type) => {
  return (
    <div>
      <label htmlFor="">Piece Name / No.</label>
      <input type="text" />

      <label htmlFor="">BPM</label>
      <input type="text" />

      <label htmlFor="">Time of Focus</label>
      <input type="text" />

      <label htmlFor="">Problem</label>
      <input type="text" />
    </div>
  )
}

const FundamentalCard = (type) => {
  return (
    <div>
      <label htmlFor="">Key</label>
      <input type="text" />

      <label htmlFor="">BPM</label>
      <input type="text" />

      <label htmlFor="">Time of Focus</label>
      <input type="text" />

      <label htmlFor="">Problem</label>
      <input type="text" />
    </div>
  )
}

const FundamentalEnum = [
  "scales",
  "arpeggios",
  "chords",
  "octaves",
  "repeated notes",
  "thirds/sixths"
]

const FundamentalItem = (type) => {
  return (
    <div>
      <input type="checkbox" />
      <label htmlFor="">Fundamental Type</label>
    </div>
  )
}

const FundamentalForm = (type) => {
  return (
    <div>
      <h2><ListMusic aria-hidden='true' color='#f2b53d' size={18} /> Fundamentals</h2>
      <button className='logger-add-button'>+ Add New Item</button>



    </div>
  )
} 

const PieceForm = (type) => {
  return (
    <div>
      <h2><Music2 aria-hidden='true' color='#f2b53d' size={18} /> Practice Pieces</h2>
      <button className='logger-add-button'>+ Add New Piece</button>
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

const Date = () => {
  return (
    <div className='logger-field'>
      <label htmlFor="practice-date"><CalendarDays aria-hidden='true' color='#f2b53d' size={18} /> Practice Date</label>
      <input id="practice-date" type="date" />
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
        <select id='practice-hours' name='practiceHours' aria-label='Practice hours' defaultValue='0'>
          {hours.map((hour) => <option key={hour} value={hour}>{hour} hr</option>)}
        </select>
        <select id='practice-minutes' name='practiceMinutes' aria-label='Practice minutes' defaultValue='0'>
          {minutes.map((minute) => <option key={minute} value={minute}>{minute} min</option>)}
        </select>
      </div>
    </div>
  )
}

const ActionButtons = () => {
  return (
    <button className='logger-save-button'><Save aria-hidden='true' size={16} /> Save Log <ArrowRight aria-hidden='true' size={16} /></button>
  )
}

function Logger() {

  return (
    <div className='logger-page'>
      <header className='logger-header'>
        <span aria-hidden='true'>|</span>
        <h1>Piano Logger</h1>
      </header>

      <div className='logger-card'>
        <div className='logger-session-fields'>
          <Date />
          <PracticeTime />
        </div>

        <FundamentalForm />

        <PieceForm />

        <ReflectionForm />

        <ActionButtons />
      </div>
    </div>
  )
}

export default Logger
