import AppRouter from "./routes/AppRouter";
import Footer from "./components/Footer"; // Asegúrate de la ruta correcta

function App() {
  return (
    <div id="root-layout"> 
      <div className="main-content">
        <AppRouter />
      </div>
      <Footer />
    </div>
  );
}

export default App;
