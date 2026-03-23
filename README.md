# 🏥 GreenCare Hospital - Modern Full-Stack Healthcare Platform

A premium, modern, and responsive hospital application built with a **Green Medical Theme**. This application features a robust "Full-Stack" simulation using a centralized service-driven architecture, enabling Authentication, Appointment Booking, Patient Dashboards, and an Admin Management Panel.

---

## 🌟 Key Features

### 🏢 Modern Landing Page
-   **GreenCare Experience**: A high-end visual aesthetic with glassmorphism, micro-animations, and responsive layouts.
-   **Dynamic Doctor Listing**: Professional profiles with real photos (AI-generated) and specialized service descriptions.
-   **Integrated Booking**: A smart appointment form allowing patients to select doctors based on specialty and choice of date/time.

### 🔐 Full-Stack Authentication & Security
-   **Patient Auth**: Complete Sign-In and Sign-Up systems (Email/Password).
-   **Admin Access**: Dedicated role for hospital administrators to manage operations.
-   **Data Isolation**: Patients access only their own medical data, whereas admins have oversight of all records.

### 📊 Patient Dashboard
-   **Appointment Tracking**: Real-time view of scheduled, completed, and cancelled visits.
-   **Medical Records**: Simulated cloud upload system for medical reports.
-   **Personalized Experience**: Tailored greeting and health journey tracking.

### 🛡️ Admin Management Panel
-   **Operation Oversight**: Search and filter all appointments by patient name, doctor, or status.
-   **Status Management**: Update appointment lifecycle (e.g., set to "Completed" or "Cancelled").
-   **Insightful Metrics**: Track total appointments and active patients across the entire hospital system.

---

## 🛠️ Technical Architecture

-   **Frontend**: Vanilla JavaScript (ES Module-based), HTML5, Canvas-style CSS animations.
-   **Styling**: Premium CSS Design System (Custom Variables, Flex/Grid, Glassmorphic effects).
-   **Icons**: Lucide Modern Iconography.
-   **Backend (Simulation)**: `db.js` acts as a mock "Cloud Firestore" using `LocalStorage` for full data persistence.
-   **Build Tool**: Vite (Next Generation Frontend Tooling).
-   **Images**: Specialized photorealistic healthcare assets.

---

## 🚀 Getting Started

### 1. Installation
Ensure you have Node.js installed. In the project root, run:
```bash
npm install
```

### 2. Development Mode
Start the Vite development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🏗️ File Structure

```
├── assets/                    # Professional medical images and assets
├── db.js                      # Centralized Backend & Auth Simulation
├── main.js                    # Core App Logic & Routing
├── style.css                  # Modern CSS Design System
├── index.html                 # Main Entry Point & Component Layout
└── package.json               # Project dependencies (Vite, Lucide)
```

---

## 🔑 Demo Access (Admin Role)

To access the administrative features and oversee hospital operations, log in with these credentials:

-   **Admin Email**: `admin@hospital.com`
-   **Password**: `admin`

---

## 🎨 Designed For Excellence
Created with a focus on ease of use, medical trust, and cutting-edge visual design.

© 2026 GreenCare Hospital | Modern Healthcare Solutions
