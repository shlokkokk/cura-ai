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
import Navbar from './components/Navbar';

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

// Smooth scroll wrapper — uses ScrollSmoother on all pages
function SmoothedApp() {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const { pathname } = useLocation();
  const [ready, setReady] = React.useState(false);

  // Scroll to top and refresh ScrollTrigger on route change
  useEffect(() => {
    if (!ready) return;
    window.scrollTo(0, 0);
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTop(0);
    }
    // Let the new page render completely before recalculating ScrollTrigger positions
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname, ready]);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Desktop only — ScrollSmoother causes sticky/bouncy touch behavior on mobile
    mm.add(
      '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
      () => {
        const smoother = ScrollSmoother.create({
          wrapper: wrapperRef.current,
          content: contentRef.current,
          smooth: 1.4,          // 1.4s lag — luxuriously smooth on desktop
          effects: true,         // enable data-speed / data-lag parallax attrs
          ignoreMobileResize: true,
        });
        setReady(true);

        return () => {
          smoother.kill();
          setReady(false);
        };
      }
    );

    // Mobile + reduced-motion: skip ScrollSmoother, use native scroll
    mm.add(
      '(max-width: 768px)',
      () => {
        setReady(true);
        return () => setReady(false);
      }
    );

    mm.add('(prefers-reduced-motion: reduce)', () => {
      setReady(true);
      return () => setReady(false);
    });

    return () => mm.revert();
  }, []); // Run once on mount!

  const showNavbarPaths = ['/', '/features', '/about', '/pricing'];
  const shouldShowNavbar = showNavbarPaths.includes(pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <div id="smooth-wrapper" ref={wrapperRef}>
        <div id="smooth-content" ref={contentRef}>
          {ready && <AppRoutes />}
        </div>
      </div>
    </>
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

