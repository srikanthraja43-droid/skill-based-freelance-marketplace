import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SearchPage from "./pages/SearchPage";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import BookingsPage from "./pages/BookingsPage";
import MessagesPage from "./pages/MessagesPage";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VerificationPage from "./pages/VerificationPage";
import "./index.css";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/provider/:id" element={<ProviderProfilePage />} />
              <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute roles={["provider"]}><ProviderDashboard /></ProtectedRoute>} />
              <Route path="/verify" element={<ProtectedRoute roles={["provider"]}><VerificationPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<div className="empty-state" style={{padding:"4rem 2rem", textAlign:"center"}}><div style={{fontSize:"4rem"}}>404</div><h2 style={{marginTop:"1rem"}}>Page Not Found</h2><a href="/" className="btn btn-primary" style={{marginTop:"1rem", display:"inline-flex"}}>Go Home</a></div>} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" } }} />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
