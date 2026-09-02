import { useState } from 'react'
import { CalendarDays, Clock3, Goal, ListMusic, Music2, Save, Send, Trophy } from 'lucide-react'
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
      <h2><ListMusic aria-hidden='true' color='#efc52e' size={18} /> Fundamentals</h2>
      <button>+ Add New Item</button>



    </div>
  )
} 

const PieceForm = (type) => {
  return (
    <div>
      <h2><Music2 aria-hidden='true' color='#efc52e' size={18} /> Practice Pieces</h2>
      <button>+ Add New Piece</button>
    </div>
  )
}

const ReflectionForm = (type) => {
  return (
    <div>
      <h2><Trophy aria-hidden='true' color='#efc52e' size={18} /> Today's Win</h2>
      <textarea aria-label="Today's win" placeholder="One thing that was better than last time" />
      
      <h2><Goal aria-hidden='true' color='#efc52e' size={18} /> Tomorrow's Focus</h2>
      <textarea aria-label="Tomorrow's focus" placeholder="What will you work on next?" />
    </div>
  )
}

const Date = () => {
  return (
    <>
      <label htmlFor="practice-date"><CalendarDays aria-hidden='true' color='#efc52e' size={18} /> Practice Date</label>
      <input id="practice-date" type="text" />
    </>
  )
}

const PracticeTime = () => {
  return (
    <>
      <label htmlFor="practice-time"><Clock3 aria-hidden='true' color='#efc52e' size={18} /> Total Practice Time</label>
      <input id="practice-time" type="text" />
    </>
  )
}

const ActionButtons = () => {
  return (
    <>
      <button><Save aria-hidden='true' color='#efc52e' size={16} /> Save as Draft</button>
      <button><Send aria-hidden='true' color='#efc52e' size={16} /> Submit</button>
    </>
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
        <Date />

        <PracticeTime />

        <FundamentalForm />

        <PieceForm />

        <ReflectionForm />

        <ActionButtons />
      </div>
    </div>
  )
}

export default Logger
