import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import config from './config.js'
import { ThemeProvider } from './hooks/useTheme.jsx'

// Apply color theme from config (initial — ThemeProvider will manage from here)
document.documentElement.setAttribute('data-theme', config.color || 'blue')
document.documentElement.setAttribute('data-mode', config.defaultMode || 'light')

// Apply app name to tab title
document.title = config.appName || 'Management System'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
