import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { LanguageProvider } from "./context/LanguageContext"
import { VoiceProvider } from "./context/VoiceContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import WeatherPage from "./pages/WeatherPage"
import CropsPage from "./pages/CropsPage"
import MarketPage from "./pages/MarketPage"
import SchemesPage from "./pages/SchemesPage"
import IdeasPage from "./pages/IdeasPage"
import ProfilePage from "./pages/ProfilePage"
import SettingsPage from "./pages/SettingsPage"
import HelpPage from "./pages/HelpPage"

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <VoiceProvider>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DashboardPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/weather"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <WeatherPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/crops"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CropsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/market"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MarketPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/schemes"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SchemesPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ideas"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <IdeasPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <HelpPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </VoiceProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
