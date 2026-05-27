import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SettingsModal from "../components/SettingsModal";
import { useSettings } from "../context/SettingsContext";
import "../styles/layout.css";

function MainLayout() {
  const { isSettingsOpen } = useSettings();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout__main">
        <Navbar />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
      {isSettingsOpen && <SettingsModal />}
    </div>
  );
}

export default MainLayout;
