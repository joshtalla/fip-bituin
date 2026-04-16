import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreatePost from './pages/CreatePost'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/prompts/create" element={<CreatePost />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App