import { History as HistoryIcon, NotebookPen, Piano } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import './sidebar.css'

function Sidebar() {
  return (
    <aside className='app-sidebar'>
      <div className='sidebar-brand'>
        <Piano aria-hidden='true' size={22} />
        <span>Piano Log</span>
      </div>

      <nav className='sidebar-nav' aria-label='Main navigation'>
        <NavLink to='/' end className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}>
          <NotebookPen aria-hidden='true' size={18} />
          Logger
        </NavLink>
        <NavLink to='/history' className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}>
          <HistoryIcon aria-hidden='true' size={18} />
          History
        </NavLink>
      </nav>

      <p className='sidebar-note'>One focused session at a time.</p>
    </aside>
  )
}

export default Sidebar
