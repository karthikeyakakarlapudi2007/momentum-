import { HabitsProvider } from "./context/HabitsContext";
import { ToastProvider } from "./context/ToastContext";
import { SearchProvider } from "./context/SearchContext";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SettingsProvider>
          <HabitsProvider>
            <SearchProvider>
              <AppRoutes />
            </SearchProvider>
          </HabitsProvider>
        </SettingsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
