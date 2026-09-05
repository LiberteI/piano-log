import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './layout/AppShell.tsx'
import History from './pages/History.tsx'
import Login from './pages/Login.tsx'
import PracticeReport from './pages/PracticeReport.tsx'
import Logger from './log_form/logger.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<AppShell />}>
          <Route path='/' element={<Logger />} />
          <Route path='/history' element={<History />} />
          <Route path='/history/:practiceDate' element={<PracticeReport />} />
        </Route>
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
