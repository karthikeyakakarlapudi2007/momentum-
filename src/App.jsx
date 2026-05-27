import { HabitsProvider } from "./context/HabitsContext";
import { ToastProvider } from "./context/ToastContext";
import { SearchProvider } from "./context/SearchContext";
import { SettingsProvider } from "./context/SettingsContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <HabitsProvider>
          <SearchProvider>
            <AppRoutes />
          </SearchProvider>
        </HabitsProvider>
      </SettingsProvider>
    </ToastProvider>
  );
}

export default App;
