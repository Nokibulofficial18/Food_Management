import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Logs from './pages/Logs';
import Inventory from './pages/Inventory';
import Resources from './pages/Resources';
import Analysis from './pages/Analysis';
import MealPlanner from './pages/MealPlanner';
import OCRScanner from './pages/OCRScanner';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <Layout>
                  <Logs />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Layout>
                  <Resources />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analysis />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/meal-planner"
            element={
              <ProtectedRoute>
                <Layout>
                  <MealPlanner />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/ocr-scanner"
            element={
              <ProtectedRoute>
                <Layout>
                  <OCRScanner />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
