# CURA.AI - Complete Technical Project Documentation

## 1. Project Overview
**CURA.AI** is a comprehensive, web-based medical simulation platform designed to allow medical students and professionals to "Practice medicine with realistic AI patients." The application provides a risk-free environment for users to conduct patient interviews, review realistic medical reports, arrive at diagnoses, and receive instant, AI-driven clinical feedback.

## 2. Core Features
*   **Safe Practice:** Users can learn and make clinical mistakes in a completely risk-free, simulated environment.
*   **Smart AI Patients:** The core simulation engine uses advanced Large Language Models (LLMs) to dynamically generate patient responses to user queries in real-time.
*   **Multi-Specialties:** The platform supports various medical fields. The highlighted **Cardiology** section includes STEMI, Atrial Fibrillation, and Heart Failure scenarios.
*   **Realistic Medical Reports:** The simulation lab includes an integrated Medical Reports viewer, allowing users to analyze authentic ECGs, Lab Panels, and X-Rays directly tied to the active case.
*   **Frictionless Demo Mode:** Allows users to try a "Demo Case" without needing to create an account, safely bypassing Supabase authentication.

## 3. Technology Stack
*   **Frontend:** React.js (via Vite), React Router DOM.
*   **Styling:** Custom Vanilla CSS tailored from Figma designs, using robust flexbox layouts and custom SVG icons.
*   **Backend:** Node.js with Express.js. Acts as the orchestrator for user sessions and AI generation endpoints.
*   **AI Integration:** Modular architecture supporting local (Ollama) and cloud (Gemini, OpenAI) LLMs.
*   **Database & Authentication:** Supabase (PostgreSQL).
*   **Deployment:** Vercel (Frontend/Backend combined Serverless architecture).

---

## 4. How We Built It: Step-by-Step Implementation

### Phase 1: Frontend Infrastructure & Routing
We initialized the project using `Vite` with the React template to ensure ultra-fast hot module replacement during development.
1. **Global Styling Setup:** We imported the Figma design tokens into `cura.css` and `index.css`. We structured common utilities like buttons (`.button13`, `.button18`) and layouts (`.column-22`) to maintain a strict visual identity with rounded corners, subtle glassmorphic backgrounds, and deep purple accent gradients (`var(--1)` to `var(--2)`).
2. **Routing Architecture:** In `App.jsx`, we implemented `react-router-dom` to route between the Landing page (`/`), Authentication pages (`/login`, `/signup`), the Dashboard (`/dashboard`), and the core Simulator (`/simulator`).
3. **Responsive Navigation:** We built `Navbar.jsx` and `Footer.jsx` using modular components. The footer was dynamically structured to display application features perfectly aligned across all pages.

### Phase 2: Database & Authentication (Supabase)
To manage user sessions and save simulated cases, we integrated Supabase.
1. **Auth Context:** We built `AuthContext.jsx` to wrap the application, providing global access to the `user` object. It listens to Supabase's `onAuthStateChange` to automatically log users in or out.
2. **Guest Mode Implementation:** For the hackathon demo, forcing users to create an account creates friction. We built a robust bypass in `Simulator.jsx`:
   * When a user clicks "Try Demo Case", they are routed to `/simulator?demo=cardiology`.
   * We generate a temporary, cryptographically secure UUID (`crypto.randomUUID()`) to act as the guest's ID.
   * **Critical Bug Fix:** We initially faced an infinite rendering loop in React because the guest user object was being recreated on every render. We solved this by wrapping the guest user instantiation in a `React.useMemo` hook, stabilizing the component tree.

### Phase 3: The AI Engine (Backend Services)
The magic of CURA.AI relies on the seamless generation of patient personalities.
1. **Service Modularity:** In the backend `src/services/` directory, we built distinct modules for `ollama.js`, `gemini.js`, and prepared for `openai.js`.
2. **System Prompt Engineering:** When a session starts, the backend passes a highly detailed system prompt to the LLM. The prompt instructs the AI to *roleplay* as a patient presenting with specific symptoms (e.g., crushing chest pain for a STEMI). It strictly enforces rules like "do not reveal your diagnosis" and "only answer what is asked."
3. **Pre-Built Fallbacks:** Because generating a high-quality patient dynamically can take 10-15 seconds (which feels long during a demo), we hardcoded 10 incredibly detailed "Pre-Built" cases in `backend/src/data/cases.json`. When a user requests a cardiology demo, the backend instantly pulls a pre-built case (like "Alex Carter, 62, Inferior STEMI"), bypassing the LLM wait time.

### Phase 4: Building the Simulation Lab UI (`Simulator.jsx`)
The `Simulator.jsx` component is the heart of the application. It required complex state management.
1. **Three-Panel Layout:**
   * **Left Panel:** Displays the active patient's vitals (Heart Rate, Blood Pressure, SpO2) and demographic information.
   * **Center Panel:** The Chat Interface. Maps through the `messages` array, rendering User queries in blue bubbles and AI Patient responses in gray bubbles.
   * **Right Panel:** The "Patient Reports" section.
2. **The Patient Reports Engine:** We built a dynamic mapping system (`cardiologyReports`) that links specific medical condition keywords to realistic images.
   * For example, if the active case involves a "myocardial infarction", the system maps the user to an authentic 12-Lead ECG STEMI interpretation image and an ECG Pattern Comparison chart.
   * We built a custom **Lightbox Component** allowing users to click a thumbnail and view the high-resolution medical report in a full-screen, dark-mode overlay for clinical accuracy.

### Phase 5: Production Deployment & Vercel Configuration
1. **API Proxying:** To prevent CORS issues during local development, we configured `vite.config.js` to proxy all `/api` requests to `localhost:3000`.
2. **Environment Variables:** We strictly separated secrets (Supabase URL, Anon Key, Gemini API Key) into `.env` files, ensuring they are securely loaded into the Node environment.
3. **Vercel Serverless Architecture:** The codebase was pushed to GitHub and linked to Vercel. Vercel automatically detects the Vite frontend build process (`npm run build`), while simultaneously deploying the backend Express routes as Serverless Functions, resulting in a perfectly unified deployment.

---

## 5. Future Roadmap
*   **Expanded Specialties:** Adding comprehensive case libraries for Neurology, Pediatrics, and Emergency Medicine.
*   **Voice Integration:** Allowing users to literally "speak" to the AI patients using Web Speech API speech-to-text.
*   **Advanced Analytics:** Providing users with detailed, rubric-based grading on their clinical reasoning and empathy skills after each case is concluded.
