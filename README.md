# Smart City Management Intelligence Portal

This repository contains the complete frontend and backend source code for the Smart City Management dashboard. It is designed to act as a centralized hub for managing city infrastructure and handling citizen complaints securely.

## Tech Stack Overview

### Frontend (Client Application)
*   **Core Framework**: React (via Vite)
*   **Styling**: Tailwind CSS
*   **Design Typography**: Outfit (Google Fonts)
*   **Iconography**: Lucide-React
*   **Animations**: Framer Motion
*   **Routing & State**: React Hooks (`useState`, `useEffect`)

### Backend (Server API)
*   **Runtime Environment**: Node.js
*   **Server Framework**: Express.js
*   **Database**: SQLite (local serverless flat-file DB for extreme portability)
*   **Middleware**: CORS, Body-Parser

## Proposed Solution Breakdown

### 1. Dual-Role Architecture (Role-Based Access Control)
The application dynamically alters its UI and available tools based on the authority level of the logged-in user:
-   **Citizen View**: Focuses entirely on searching public infrastructure data, submitting geographical issue reports (e.g., Road Damage, Power Outages), and tracking the status of those specific reports under "My Reports".
-   **Admin View**: Gains absolute CRUD (Create, Read, Update, Delete) privileges over all city assets. Has a unified dashboard to review all pending Citizen Reports and update their statuses to notify the public.

### 2. Streamlined Issue Pipeline
-   **Inline Reporting**: Citizens do not have to navigate to a separate form to submit a complaint. Every infrastructure asset card contains an inline "Report" button, pre-linking the complaint to the exact geographical asset in the database.
-   **Separation of State**: Reports start in the **"My Reports"** tab for the citizen. Once an admin acknowledges the issue and changes its status (In Progress, Resolved), it mathematically moves from the citizen's personal inbox into the public **"Maintenance Records"** permanent history log.

### 3. Real-Time Admin Alerts
-   **Asynchronous Polling**: The frontend securely queries the backend on an interval to detect new citizen reports.
-   **Sidebar Badges & Toasts**: When a new issue arises, the Admin's sidebar immediately pulses a red unread badge next to the "Issue Tracker" and slides up an animated "NEW ISSUES WAS ARISE" toast alert, ensuring rapid city response times.

### 4. Premium Aesthetic & UX
-   **Glassmorphism Layout**: Deep space gradients mixed with translucent frosted-glass cards (via Tailwind's backdrop-blur) deliver a cutting-edge command center aesthetic.
-   **Micro-Interactions**: Hover states, animated borders, and physics-based spring animations (via Framer Motion) provide satisfying, tactile feedback to every user action, heavily elevating the perceived quality of the portal.

## Setup & Running Locally

1. Clone the repository.
2. In Terminal Window 1, navigate to `/backend`:
   ```bash
   cd backend
   npm install
   npm start
   ```
3. In Terminal Window 2, navigate to `/frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Access the portal at `http://localhost:5173`.
