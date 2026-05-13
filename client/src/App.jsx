import AppRouter from './routes/AppRouter';
import Stars from './components/Stars';
import './App.css';

function App() {
  return (
    <>
<<<<<<< HEAD
      {/* Removed the 10000 count so it defaults to the safe 150 */}
      <Stars /> 
=======
      <Stars count={1000} />
>>>>>>> main
      <div className="app-shell">
        <AppRouter />
      </div>
    </>
  );
}

export default App;