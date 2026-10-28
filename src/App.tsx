import SettingsProvider from './state/SettingsProvider'
import ViewerContainer from './components/ViewerContainer'
import SettingsSheet from './components/settings/SettingsSheet'
import './App.css'

function App() {
  return (
    <SettingsProvider>
      <div className="app">
        <ViewerContainer />
        <SettingsSheet />
      </div>
    </SettingsProvider>
  )
}

export default App
