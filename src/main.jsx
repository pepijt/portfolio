import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrinterPortfolio from './PrinterPortfolio'
import LoginPage from './pages/LoginPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PrinterPortfolio />} />
          <Route path="/about" element={<PrinterPortfolio />} />
          <Route path="/projects" element={<PrinterPortfolio />} />
          <Route path="/contact" element={<PrinterPortfolio />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
