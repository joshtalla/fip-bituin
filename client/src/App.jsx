import AppRouter from './routes/AppRouter';
import Stars from './components/Stars';
import './App.css';

function App() {
  return (
    <>
      <Stars count={1000} />
      <div className="app-shell">
        <AppRouter />
      </div>
    </>
  );
}

export default App;
