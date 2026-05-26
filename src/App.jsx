import { HabitsProvider } from "./context/HabitsContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <HabitsProvider>
      <AppRoutes />
    </HabitsProvider>
  );
}

export default App;
