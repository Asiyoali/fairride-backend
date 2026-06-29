import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MyTrips from "./pages/MyTrips";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";

// ====== KAN AYAA CUSUB: SOO JIIDO BOGAGGA CUSUB ======
import { AboutPage } from "./pages/About";
import { ContactPage } from "./pages/Contact";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />

        {/* ====== KAN AYAA CUSUB: DARIIQYADA BOGAGGA CUSUB ====== */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* 8. 404 Catch-All Route: Haddii qofku qoro bog aan jirin toos halkan ayaa loo tuurayaa */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
