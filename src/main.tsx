import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Homepage from './Homepage.tsx'

// Lazy-load all exploration pages — keeps homepage bundle small
const App = lazy(() => import('./App.jsx'))
const PageOne = lazy(() => import('./PageOne.tsx'))
const PageTwo = lazy(() => import('./PageTwo.tsx'))
const Direction1 = lazy(() => import('./Direction1.tsx'))
const Direction2 = lazy(() => import('./Direction2.tsx'))
const Direction3 = lazy(() => import('./Direction3.tsx'))
const Direction4 = lazy(() => import('./Direction4.tsx'))
const Direction5 = lazy(() => import('./Direction5.tsx'))
const Direction6 = lazy(() => import('./Direction6.tsx'))
const Direction7 = lazy(() => import('./Direction7.tsx'))
const Direction8 = lazy(() => import('./Direction8.tsx'))
const Direction9 = lazy(() => import('./Direction9.tsx'))
const Direction10 = lazy(() => import('./Direction10.tsx'))
const Direction11 = lazy(() => import('./Direction11.tsx'))
const Direction12 = lazy(() => import('./Direction12.tsx'))
const Direction13 = lazy(() => import('./Direction13.tsx'))
const Direction14 = lazy(() => import('./Direction14.tsx'))
const Direction15 = lazy(() => import('./Direction15.tsx'))
const Direction16 = lazy(() => import('./Direction16.tsx'))
const MapControls = lazy(() => import('./MapControls.tsx'))
const XeroxMap = lazy(() => import('./XeroxMap.tsx'))
const NeonMap = lazy(() => import('./NeonMap.tsx'))
const EtchedMap = lazy(() => import('./EtchedMap.tsx'))
const EtchedMap2 = lazy(() => import('./EtchedMap2.tsx'))
const Glossary = lazy(() => import('./Glossary.tsx'))
const Secret = lazy(() => import('./Secret.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<EtchedMap />} />
          <Route path="/index" element={<Glossary />} />
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
          <Route path="/d12" element={<Direction10 />} />
          <Route path="/d13" element={<Direction11 />} />
          <Route path="/d14" element={<Direction12 />} />
          <Route path="/d15" element={<Direction13 />} />
          <Route path="/d16" element={<Direction14 />} />
          <Route path="/d17" element={<Direction15 />} />
          <Route path="/d18" element={<Direction16 />} />
          <Route path="/xerox" element={<XeroxMap />} />
          <Route path="/neon" element={<NeonMap />} />
          <Route path="/etched" element={<EtchedMap />} />
          <Route path="/etched-2" element={<EtchedMap2 />} />
          <Route path="/map-controls" element={<MapControls />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/secret" element={<Secret />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
