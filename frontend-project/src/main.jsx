import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import config from './config.js'

// Apply color theme from config — sets data-theme on <html>
document.documentElement.setAttribute('data-theme', config.color || 'blue')

// Apply app name to tab title
document.title = config.appName || 'Management System'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
