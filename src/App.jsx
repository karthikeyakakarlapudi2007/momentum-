import { AuthProvider } from "./context/AuthContext";
import { HabitsProvider } from "./context/HabitsContext";
import { ToastProvider } from "./context/ToastContext";
import { SearchProvider } from "./context/SearchContext";
import { SettingsProvider } from "./context/SettingsContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <HabitsProvider>
            <SearchProvider>
              <AppRoutes />
            </SearchProvider>
          </HabitsProvider>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
