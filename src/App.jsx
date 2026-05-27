import { HabitsProvider } from "./context/HabitsContext";
import { ToastProvider } from "./context/ToastContext";
import { SearchProvider } from "./context/SearchContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <HabitsProvider>
        <SearchProvider>
          <AppRoutes />
        </SearchProvider>
      </HabitsProvider>
    </ToastProvider>
  );
}

export default App;
