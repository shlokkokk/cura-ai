import React, { useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import Features from './pages/Features';
import About from './pages/About';
import Profile from './pages/Profile';
import PatientHistory from './pages/PatientHistory';
import Pricing from './pages/Pricing';
import EkgMouseTrail from './components/EkgMouseTrail';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/features"  element={<Features />} />
      <Route path="/about"     element={<About />} />
      <Route path="/pricing"   element={<Pricing />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/history"   element={<ProtectedRoute><PatientHistory /></ProtectedRoute>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Smooth scroll wrapper — conditionally uses ScrollSmoother on all pages except Features
function SmoothedApp() {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const { pathname } = useLocation();
  const isFeaturesPage = pathname === '/features';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTop(0);
    }
  }, [pathname]);

  useGSAP(() => {
    if (isFeaturesPage) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.4,          // 1.4s lag — luxuriously smooth
        effects: true,         // enable data-speed / data-lag parallax attrs
        normalizeScroll: true, // neutralise browser scroll jank on mobile
        ignoreMobileResize: true,
      });

      return () => smoother.kill();
    });

    return () => mm.revert();
  }, [pathname]);

  if (isFeaturesPage) {
    return <AppRoutes />;
  }

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        <AppRoutes />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <EkgMouseTrail />
          <SmoothedApp />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

