import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Logger from './log_form/logger.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Logger />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
