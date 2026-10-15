import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@fontsource/alef/400.css'
import '@fontsource/alef/700.css'
import './index.css'
import { seedSampleDeck } from './lib/seed.ts'

// Seed the sample deck on first run
seedSampleDeck().catch(console.error)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
