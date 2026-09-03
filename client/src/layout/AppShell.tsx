import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.tsx'
import './app-shell.css'

function AppShell() {
  return (
    <div className='app-shell'>
      <Sidebar />
      <main className='app-content'>
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
