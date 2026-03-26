import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PageOne from './PageOne.tsx'
import PageTwo from './PageTwo.tsx'
import Direction1 from './Direction1.tsx'
import Direction2 from './Direction2.tsx'
import Direction3 from './Direction3.tsx'
import Direction4 from './Direction4.tsx'
import Direction5 from './Direction5.tsx'
import Direction6 from './Direction6.tsx'
import Direction7 from './Direction7.tsx'
import Direction8 from './Direction8.tsx'
import Direction9 from './Direction9.tsx'
import Glossary from './Glossary.tsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Glossary />} />
        <Route path="/d0" element={<App />} />
        <Route path="/d1" element={<PageOne />} />
        <Route path="/d2" element={<PageTwo />} />
        <Route path="/d3" element={<Direction1 />} />
        <Route path="/d4" element={<Direction2 />} />
        <Route path="/d5" element={<Direction3 />} />
        <Route path="/d6" element={<Direction4 />} />
        <Route path="/d7" element={<Direction5 />} />
        <Route path="/d8" element={<Direction6 />} />
        <Route path="/d9" element={<Direction7 />} />
        <Route path="/d10" element={<Direction8 />} />
        <Route path="/d11" element={<Direction9 />} />
        <Route path="/glossary" element={<Glossary />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
