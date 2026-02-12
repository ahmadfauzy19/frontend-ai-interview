import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import SpeechToTextPage from './pages/speechToText'
import IdentityPage from './pages/identity'
import ProtectedInterviewRoute from './guard/protectedInterviewRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/speech-to-text" element={<ProtectedInterviewRoute><SpeechToTextPage /></ProtectedInterviewRoute>} />
        <Route path="/identity" element={<IdentityPage />} />
        <Route path="/" element={<Navigate to="/identity" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
