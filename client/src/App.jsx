import { Route, Routes } from "react-router-dom";
import "./App.css";
import CreatePromptPost from "./pages/CreatePromptPost";
import PromptBoard from "./pages/PromptBoard";

function App() {
  return (
    <main className="min-h-screen w-full bg-black">
      <header className="flex h-[116px] w-full items-center justify-between font-poppins text-[24px] font-semibold text-white">
        Bituin
      </header>
      <Routes>
        <Route path="/" element={<PromptBoard />} />
        <Route path="/prompts/create" element={<CreatePromptPost />} />
      </Routes>
    </main>
  );
}

export default App;
