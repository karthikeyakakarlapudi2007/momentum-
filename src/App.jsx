import { HabitsProvider } from "./context/HabitsContext";
import { ToastProvider } from "./context/ToastContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <HabitsProvider>
        <AppRoutes />
      </HabitsProvider>
    </ToastProvider>
  );
}

export default App;
