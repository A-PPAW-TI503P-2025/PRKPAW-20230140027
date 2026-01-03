import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardPage from "./components/DashboardPage";
import AttendancePage from "./components/AttendancePage";
import ReportPage from "./components/ReportPage";
// --- TAMBAHAN IMPORT ---
import SensorPage from "./components/SensorPage"; 
// -----------------------
import Navbar from "./components/Navbar";
import "leaflet/dist/leaflet.css";

const MainLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />
          <Route
            path="/attendance"
            element={
              <MainLayout>
                <AttendancePage />
              </MainLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <MainLayout>
                <ReportPage />
              </MainLayout>
            }
          />
          
          {/* --- TAMBAHAN ROUTE MONITORING --- */}
          <Route
            path="/monitoring"
            element={
              <MainLayout>
                <SensorPage />
              </MainLayout>
            }
          />
          {/* --------------------------------- */}

          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;