import React from 'react';
import ReactDOM from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import App from './App.jsx';
import './index.css';

// Register GSAP plugins once globally before any component renders
gsap.registerPlugin(
  ScrollTrigger,
  ScrollSmoother,
  useGSAP,
  SplitText,
  DrawSVGPlugin,
  ScrambleTextPlugin,
  CustomEase,
);

// Brand easing — smooth overshoot, feels premium and alive
CustomEase.create('brandEase', '0.22, 1, 0.36, 1');
// Snappy micro-interaction ease
CustomEase.create('snapEase', '0.34, 1.56, 0.64, 1');

// Global defaults — every tween inherits these unless overridden
gsap.defaults({ ease: 'brandEase', duration: 0.7 });

// Apply saved theme before first paint to avoid flash
const savedTheme = localStorage.getItem('cura_theme') ||
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
document.documentElement.setAttribute('data-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

