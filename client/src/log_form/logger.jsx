import { useState } from 'react'
import { CalendarDays, Clock3, Goal, ListMusic, Music2, Save, Send, Trophy } from 'lucide-react'

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
      <label htmlFor="">One thing that was better than last time</label>
      <input type="text" />
      
      <h2><Goal aria-hidden='true' color='#efc52e' size={18} /> Tomorrow's Focus</h2>
      <label htmlFor="">What will you work on next?</label> 
      <input type="text" />
    </div>
  )
}

function Logger() {

  return (
    <div>
      <h1>|</h1>
      <h1>Piano Logger</h1>

      <label htmlFor=""><CalendarDays aria-hidden='true' color='#efc52e' size={18} /> Practice Date</label>
      <input type="text" />

      <label htmlFor=""><Clock3 aria-hidden='true' color='#efc52e' size={18} /> Total Practice Time</label>
      <input type="text" />

      <FundamentalForm />

      <PieceForm />

      <ReflectionForm />

      <button><Save aria-hidden='true' color='#efc52e' size={16} /> Save as Draft</button>
      <button><Send aria-hidden='true' color='#efc52e' size={16} /> Submit</button>
    </div>
  )
}

export default Logger
