import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import the AuthProvider component from the AuthContext file 
// to provide authentication context to the application
import { AuthProvider } from "./context/AuthContext"; 
import './index.css'
import App from './App.jsx'

// Create a root element for rendering the React application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
  <App />
</AuthProvider>
  </StrictMode>,
)
