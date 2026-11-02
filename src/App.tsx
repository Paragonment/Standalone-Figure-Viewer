import SettingsProvider from './state/SettingsProvider'
import ViewerContainer from './components/ViewerContainer'
import SettingsPage from './components/settings/SettingsPage'
import ShortcutsDialog from './components/shortcuts/ShortcutsDialog'
import './App.css'

function App() {
  return (
    <SettingsProvider>
      <div className="app">
        <ViewerContainer />
        <SettingsPage />
        <ShortcutsDialog />
      </div>
    </SettingsProvider>
  )
}

export default App
