import { useState, useEffect } from 'react'
import ViewerContainer from './components/ViewerContainer'
import './App.css'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    document.documentElement.classList.add('no-transitions');
    
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);

    // Force a reflow to flush styles synchronously
    void window.getComputedStyle(document.documentElement).opacity;

    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 20);
  }

  return (
    <div className="app">
      <ViewerContainer theme={theme} toggleTheme={toggleTheme} />
    </div>
  )
}

export default App
