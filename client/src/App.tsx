import { type FormEvent, useState } from 'react'

const fundamentalSkills = [
  'Scales',
  'Arpeggios',
  'Octaves',
  'Jumps',
  'Rotation',
  'Voicing',
  'Repeated notes',
  'Double notes (thirds and sixths)',
  'Hand synchronization',
  'Polyphonic control',
  'Chord technique',
]

function App() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main>
      <header>
        <h1>Piano Progress Log</h1>
        <p>Record one focused piano practice session.</p>
      </header>

      <section aria-labelledby="how-to-use-heading">
        <h2 id="how-to-use-heading">How to Use</h2>
        <p>After every session, complete this form and save the entry.</p>
        <ol>
          <li>Each session belongs to a week folder.</li>
          <li>Weekly commitment is 7 to 10 hours.</li>
          <li>This log works as a scrum update.</li>
          <li>Week folders use the Monday of that week: <code>YYYY-MM-DD/</code>.</li>
          <li>Daily logs use the real date as the filename: <code>YYYY-MM-DD.md</code>.</li>
          <li>The filename is the source of truth for the practice date.</li>
        </ol>
      </section>

      <section aria-labelledby="rules-heading">
        <h2 id="rules-heading">Rules of Thumb</h2>
        <ol>
          <li>Practice with full attention; do not play on autopilot.</li>
          <li>Prioritize control and musicality over raw BPM.</li>
          <li>Practice slowly enough to stay accurate and relaxed.</li>
          <li>Be honest about weak spots and work on the highest-leverage problem first.</li>
          <li>Consistency matters more than intensity.</li>
          <li>Stop or reset when focus is gone.</li>
        </ol>
      </section>

      <section aria-labelledby="session-heading">
        <h2 id="session-heading">Session</h2>
        <p>Only total practice time is required. All other fields are optional.</p>

        <form onSubmit={handleSubmit}>
          <p>
            <label htmlFor="total-time">Total time (minutes, required)</label>
            <input id="total-time" name="totalTime" type="number" min="1" required />
          </p>

          <fieldset>
            <legend>Hanon</legend>
            <p>
              <label htmlFor="hanon-piece">Piece number</label>
              <input id="hanon-piece" name="hanonPiece" placeholder="No. 1" />
            </p>
            <p>
              <label htmlFor="hanon-bpm">BPM</label>
              <input id="hanon-bpm" name="hanonBpm" type="number" min="1" />
            </p>
            <p>
              <label htmlFor="hanon-technique">Technique focus</label>
              <input id="hanon-technique" name="hanonTechniqueFocus" />
            </p>
            <p>
              <label htmlFor="hanon-time">Time of focus (minutes)</label>
              <input id="hanon-time" name="hanonTimeOfFocus" type="number" min="1" />
            </p>
            <p>
              <label htmlFor="hanon-problem">Problem</label>
              <textarea id="hanon-problem" name="hanonProblem" />
            </p>
          </fieldset>

          <fieldset>
            <legend>Fundamentals</legend>
            {fundamentalSkills.map((skill) => (
              <p key={skill}>
                <label>
                  <input name="fundamentals" type="checkbox" value={skill} />
                  {skill}
                </label>
              </p>
            ))}
            <p>
              <label htmlFor="fundamentals-key">Key</label>
              <input id="fundamentals-key" name="fundamentalsKey" />
            </p>
            <p>
              <label htmlFor="fundamentals-bpm">BPM</label>
              <input id="fundamentals-bpm" name="fundamentalsBpm" type="number" min="1" />
            </p>
            <p>
              <label htmlFor="fundamentals-problem">Problem</label>
              <textarea id="fundamentals-problem" name="fundamentalsProblem" />
            </p>
            <p>
              <label htmlFor="fundamentals-time">Time (minutes)</label>
              <input id="fundamentals-time" name="fundamentalsTime" type="number" min="1" />
            </p>
          </fieldset>

          <fieldset>
            <legend>Etude</legend>
            <p>
              <label htmlFor="etude-piece">Piece</label>
              <input id="etude-piece" name="etudePiece" />
            </p>
            <p>
              <label htmlFor="etude-bpm">BPM</label>
              <input id="etude-bpm" name="etudeBpm" type="number" min="1" />
            </p>
            <p>
              <label htmlFor="etude-problem">Problem</label>
              <textarea id="etude-problem" name="etudeProblem" />
            </p>
            <p>
              <label htmlFor="etude-time">Time of focus (minutes)</label>
              <input id="etude-time" name="etudeTimeOfFocus" type="number" min="1" />
            </p>
          </fieldset>

          <fieldset>
            <legend>Repertoire</legend>
            <p>
              <label htmlFor="repertoire-piece">Piece</label>
              <input id="repertoire-piece" name="repertoirePiece" />
            </p>
            <p>
              <label htmlFor="repertoire-section">Section practiced</label>
              <input id="repertoire-section" name="repertoireSection" />
            </p>
            <p>
              <label htmlFor="repertoire-bpm">BPM</label>
              <input id="repertoire-bpm" name="repertoireBpm" type="number" min="1" />
            </p>
            <p>
              <label htmlFor="repertoire-note">Note</label>
              <textarea id="repertoire-note" name="repertoireNote" />
            </p>
            <p>
              <label htmlFor="repertoire-time">Time of focus (minutes)</label>
              <input id="repertoire-time" name="repertoireTimeOfFocus" type="number" min="1" />
            </p>
          </fieldset>

          <p>
            <label htmlFor="todays-win">Today's win</label>
            <textarea
              id="todays-win"
              name="todaysWin"
              placeholder="One thing that was better than last time"
            />
          </p>

          <p>
            <label htmlFor="tomorrows-focus">Tomorrow's focus</label>
            <textarea id="tomorrows-focus" name="tomorrowsFocus" />
          </p>

          <button type="submit">Save session</button>
        </form>

        {submitted && <p>Session is ready to save when the API endpoint is added.</p>}
      </section>
    </main>
  )
}

export default App
