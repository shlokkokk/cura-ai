# CURA.AI Launcher & Setup Guide

Welcome to **CURA.AI**, a premium, high-fidelity clinical simulation platform. 

This guide is designed for **non-technical users** (such as founders, stakeholders, or medical leaders) to get the platform up and running on a Windows laptop with minimal effort.

---

## Method 1: The Easiest Way (Instant Cloud Access)

*This is the recommended method for presentations. It requires **zero installations** and works instantly in any web browser.*

1. **Open your browser** (Google Chrome, Microsoft Edge, or Safari).
2. **Go to the link** provided by your development team:
   `https://cura-ai-pied.vercel.app` (or your custom Vercel address).
3. **Start using the app**: You can register an account, log in, view the dashboard, and run interactive patient simulations immediately.

---

## Method 2: Running Locally on your Windows Laptop

*Use this method if you want to run the platform offline or test local changes directly on your machine.*

### 1. Prerequisite: Install Node.js (Only required once)
To run the server on your computer, you need a small, free program called **Node.js**:
1. Go to the official download page: **[nodejs.org](https://nodejs.org)**.
2. Click the large button labeled **LTS (Long Term Support)** to download the installer for Windows.
3. Open the downloaded file and click **Next** through the setup prompts, accepting the default options, then click **Finish**.
4. *Node.js is now ready on your computer!*

---

### 2. Launching the App (The One-Click Method)
We have packaged the entire startup sequence into a single launcher file so you do not have to write code or open terminals.

1. **Locate the project folder** (labeled `cura-ai`) in your Windows File Explorer.
2. **Double-click the file named `run.bat`** in the root of the folder.
   *(This script will automatically scan your system ports, start the backend database, initialize the AI models, and boot up the front-end interface).*
3. **Keep the command window open** while testing the app.

---

### 3. Accessing the Application
Once the launcher has done its setup, a dashboard summary will appear inside the black window:

1. **Open your web browser** (Google Chrome is recommended).
2. Type or paste the following address into the search bar:
   **[http://localhost:5173](http://localhost:5173)**
3. Press **Enter**. The CURA.AI landing page will load!

---

### 4. Stopping the Application
When you are done testing:
* Simply **close the command prompt window** (click the red **X** in the top-right corner), or click inside the window and press **Ctrl + C** on your keyboard. 
* This safely shuts down both the frontend and backend servers and releases your network ports.

---

## Features Under the Hood

Here is a quick summary of what makes this version of CURA.AI premium:

* **Lightning-Fast AI (Groq)**: The app is pre-wired to use **Groq** (specifically running the `llama-3.3-70b-versatile` model). This generates medical patient replies and simulation grading reports in fractions of a second.
* **Persistent History (Supabase)**: When connected to the database, user logins, patient cases, conversation logs, and diagnostic evaluations are securely saved.
* **Dark & Light Themes**: The interface features a curated visual system with dynamic animations (including an active ECG heartbeat visualizer) designed specifically for a professional medical aesthetic.
