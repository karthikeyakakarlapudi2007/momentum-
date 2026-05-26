import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";

// Pages
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Analytics from "../pages/Analytics";
import AddHabit from "../pages/AddHabit";
import HabitDetails from "../pages/HabitDetails";
import MyHabits from "../pages/MyHabits";
import Calendar from "../pages/Calendar";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — no layout wrapper */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* App routes — wrapped in MainLayout (Sidebar + Navbar) */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/habits" element={<MyHabits />} />
        <Route path="/habits/add" element={<AddHabit />} />
        <Route path="/habits/:id" element={<HabitDetails />} />
        <Route path="/calendar" element={<Calendar />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
