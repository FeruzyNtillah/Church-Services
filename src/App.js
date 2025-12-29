import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container, Box } from '@mui/material';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import theme from './theme.js'; 

import { AuthProvider } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';

// Auth pages
import Login from './pages/login';
import Register from './pages/register';
import ForgotPassword from './pages/forgotPassword';

// Layout components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Protected pages
import Home from './pages/Home';
import Events from './pages/Events';
import Sermons from './pages/Sermons';
import Donations from './pages/Donations';
import Members from './pages/Members';
import Addmember from './pages/Addmember';
import Families from './pages/Families';
import FamilyDetails from './pages/FamilyDetails';

const AppLayout = ({ children }) => (
  <Box sx={{ display: 'flex' }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  </Box>
);

const App = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <CssBaseline />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgotPassword" element={<ForgotPassword />} />

              {/* Protected Routes with Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Home />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Events />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sermons"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Sermons />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donations"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Donations />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Members />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/families"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Families />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/families/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <FamilyDetails />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Addmembers"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Addmember />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members/:id/edit"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Addmember />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback to login */}
              <Route path="*" element={<Login />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;