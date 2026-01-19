import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import SyrianCalculator from './syrian'
import RealModeCalculator from './syrian/RealMode'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/lifestyle',
    element: <SyrianCalculator />,
  },
  {
    path: '/lifestyle/real',
    element: <RealModeCalculator />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
