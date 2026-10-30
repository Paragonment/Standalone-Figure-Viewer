import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DisplaySettingsProvider } from './hooks/useDisplaySettings.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DisplaySettingsProvider>
      <App />
    </DisplaySettingsProvider>
  </StrictMode>,
)
