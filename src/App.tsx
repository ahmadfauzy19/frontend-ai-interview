import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import SpeechToTextPage from './pages/speechToText'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/speech-to-text" element={<SpeechToTextPage />} />
        <Route path="/" element={<Navigate to="/speech-to-text" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
