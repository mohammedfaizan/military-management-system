import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from "./context/ThemeContext";
import { AssetBaseProvider } from './context/AssetBaseContext.jsx';
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AssetBaseProvider>
          <App />
        </AssetBaseProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
