// Root.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import App from "./App"
import LockInView from "./LockInView"
import { useMusic } from "./useMusic"

function Root() {
  const musicState = useMusic()

  return (
    <BrowserRouter>
      {/* No <audio> tag here — useMusic creates it with new Audio() internally */}
      <Routes>
        <Route path="/"       element={<App        musicState={musicState} />} />
        <Route path="/lockin" element={<LockInView  musicState={musicState} />} />
      </Routes>
    </BrowserRouter>
  )
}
export default Root