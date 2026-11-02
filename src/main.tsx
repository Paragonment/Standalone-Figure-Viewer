import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts/fonts.css'
import './index.css'
import App from './App.tsx'
import { DisplaySettingsProvider } from './hooks/useDisplaySettings.tsx'
// After the components, so the printed sheet wins ties with their styles.
import './print.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DisplaySettingsProvider>
      <App />
    </DisplaySettingsProvider>
  </StrictMode>,
)
