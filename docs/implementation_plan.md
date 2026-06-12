# PUP Manila Community Parking Management System

This document outlines the simplest implementation plan for the Community Parking Management System tailored for testing at PUP Manila. It covers team roles, required UI screens, necessary data fields, and a breakdown of files we expect to create or modify.

## Team Roles & Task Distribution

Based on the team composition, here is the proposed task distribution:

*   **Elizander Aguila (Project Manager / Lead Developer)**
    *   **Role:** Project Management, Database Architecture, Backend APIs, and the Parking Simulation Module.
    *   **Tasks:** Set up the backend server, design the database schema, handle API endpoints, and build the car driving simulation logic.
    *   **Git Branch:** `main` (Project Integration)

*   **Christian Abelarde (Frontend Developer)**
    *   **Role:** Authentication and Dashboard UI.
    *   **Tasks:** Build the Login/Registration screens and the Home Dashboard (displaying user stats, current parking status, and navigation).
    *   **Git Branch:** `abelarde-auth-dashboard`

*   **Johann Mcwee Dinaya (Frontend Developer)**
    *   **Role:** Interactive Selection UI.
    *   **Tasks:** Develop the Parking Lot map/list and the interactive slot selection interface (showing Available vs. Occupied slots).
    *   **Git Branch:** `dinaya-parking-selection`

*   **Edrian Juampit (Frontend Developer)**
    *   **Role:** Digital Ticket System.
    *   **Tasks:** Create the Digital Ticket UI, handle QR code generation/display, and build the checkout/completion flow.
    *   **Git Branch:** `juampit-digital-ticket`

*   **Xyra Mayo (UI/UX Designer & QA)**
    *   **Role:** Design System & Quality Assurance.
    *   **Tasks:** Create wireframes, ensure the application has a premium aesthetic (vibrant colors, smooth animations), and conduct user flow testing.
    *   **Git Branch:** `mayo-design-qa`

*   **Marc Kelwin Bulic (Hardware Integration & Testing)**
    *   **Role:** Hardware Logic & Simulation Support.
    *   **Tasks:** Define the exact hardware data payloads (RFID tag formats), build the simulation UI alongside Elizander, and test the physical-to-digital flow.
    *   **Git Branch:** `bulic-hardware-simulation`

---

## Step-by-Step Build Checklist

Here is the chronological sequence of tasks to build the system from start to finish:

### Phase 1: Foundation & Setup
- [ ] **Task 1.1: Project Initialization** (Elizander)
  - Initialize Next.js project.
  - Setup TailwindCSS/CSS Modules and base design tokens (colors, fonts).
- [ ] **Task 1.2: Database Setup** (Elizander)
  - Configure the database (e.g., Supabase/Firebase).
  - Create the schema for Users, Parking Lots, Slots, and Tickets.
- [ ] **Task 1.3: Design System & Wireframes** (Xyra)
  - Finalize color scheme (PUP Maroon/Gold) and UI layout.
  - Setup reusable UI components (Buttons, Cards, Inputs).

### Phase 2: Core Authentication & Dashboard
- [ ] **Task 2.1: Auth Backend** (Elizander)
  - Implement login/registration API endpoints.
- [ ] **Task 2.2: Auth Frontend** (Christian)
  - Build Login and Registration UI (`/login`).
  - Connect UI to backend Auth endpoints.
- [ ] **Task 2.3: Home Dashboard** (Christian)
  - Build Dashboard UI (`/dashboard`).
  - Fetch and display basic user data and active ticket status.

### Phase 3: Parking Selection System
- [ ] **Task 3.1: Parking API endpoints** (Elizander)
  - Create endpoints to fetch lots, fetch slots per lot, and create a booking.
- [ ] **Task 3.2: Interactive Map & Grid UI** (Johann)
  - Build the parking lot selection UI.
  - Build the interactive grid showing slots (Green/Red based on status).
- [ ] **Task 3.3: Booking Integration** (Johann)
  - Connect the grid UI to the booking API.

### Phase 4: Digital Ticket & Checkout
- [ ] **Task 4.1: Ticket API endpoints** (Elizander)
  - Create endpoints to fetch ticket details and handle checkout/exit.
- [ ] **Task 4.2: Digital Ticket UI** (Edrian)
  - Build the Digital Ticket view (`/ticket`).
  - Generate and display a QR Code for the active session.
  - Implement the "Complete Parking / Checkout" flow.

### Phase 5: Hardware Simulation
- [ ] **Task 5.1: Simulation Backend/Mocking** (Elizander)
  - Create the `POST /api/scan-rfid` endpoint to mock hardware scans.
  - Ensure the database slot status updates to OCCUPIED when scanned.
- [ ] **Task 5.2: 2D Simulation UI & Hardware Logic** (Marc / Elizander)
  - Build the `/simulation` page.
  - Create the car moving animations and the manual "Trigger RFID Scan" button.
- [ ] **Task 5.3: Real-time UI Updates** (Elizander / Johann)
  - Ensure the Parking Grid UI reflects the simulation state change immediately (e.g., polling or WebSockets).

### Phase 6: Polish & QA
- [ ] **Task 6.1: End-to-End Testing** (Xyra / Team)
  - Test the entire flow from Login -> Booking -> Simulation Scan -> Checkout.
- [ ] **Task 6.2: UI/UX Polish** (Xyra)
  - Refine micro-animations, verify mobile responsiveness, and clean up the aesthetic.

---

## The Screens / UI Sections Needed

1.  **Authentication Page (`/login`)**
    *   Login and Sign Up forms.
    *   Fields for Student/Employee ID.
2.  **Home Dashboard (`/dashboard`)**
    *   Welcome message.
    *   Quick overview: Active parking session, recent history.
    *   Call-to-action to "Find Parking".
3.  **Parking Selection & Interactive Map (`/parking`)**
    *   List/Map of PUP Manila parking lots (e.g., Main Building, CEA).
    *   Interactive grid of parking slots inside a chosen lot.
    *   Color-coded statuses (Green = Available, Red = Occupied).
4.  **Digital Ticket View (`/ticket`)**
    *   Displays assigned Slot, Entry Time, and a QR Code.
    *   Status indicator (Waiting, Parked, Completed).
5.  **Simulation Dashboard (`/simulation`)**
    *   *For presentation/testing purposes.*
    *   A 2D top-down view of a parking lot.
    *   Animations of a car entering and parking.
    *   Trigger buttons to simulate an "RFID Scan" which updates the system state.

---

## Data Fields Needed

To keep it simple, we can structure our data into four main entities:

### 1. User
*   `id` (UUID)
*   `full_name` (String)
*   `pup_id` (String - Student/Employee Number)
*   `rfid_tag` (String - unique identifier on the RFID card)
*   `password_hash` (String)

### 2. Parking Lot
*   `id` (UUID)
*   `name` (String - e.g., "PUP Main Campus Lot A")
*   `total_slots` (Integer)

### 3. Parking Slot
*   `id` (UUID)
*   `lot_id` (UUID - Foreign Key)
*   `slot_name` (String - e.g., "A1", "A2")
*   `status` (Enum: `AVAILABLE`, `OCCUPIED`, `RESERVED`)

### 4. Transaction / Ticket
*   `id` (UUID)
*   `user_id` (UUID - Foreign Key)
*   `slot_id` (UUID - Foreign Key)
*   `entry_time` (Timestamp)
*   `exit_time` (Timestamp, nullable)
*   `status` (Enum: `ACTIVE`, `COMPLETED`)

---

## Simplest Implementation Plan

We will build this as a simple, highly efficient modern web application using **Next.js**. This allows us to handle both the frontend UI and the backend API routes in a single, unified repository.

1.  **Initialization:** Scaffold a new Next.js project. Set up TailwindCSS and the design system using **PUP Manila's branding colors (Maroon and Gold)** for a premium, authentic feel.
2.  **Database & Backend:** Set up a simple cloud database (like Firebase or Supabase) or local SQLite for rapid prototyping. Create the API routes to fetch slots and book tickets.
3.  **Frontend Layouts:** Develop the main routing, Auth screens, and Dashboard components with mock data first.
4.  **Interactive Selection:** Build the parking grid UI. Connect it to the backend to reflect real-time availability.
5.  **Digital Ticket:** Implement the ticket screen with a generated QR code based on the transaction data.
6.  **Simulation Engine:** 
    *   Create a dedicated page (`/simulation`).
    *   Use HTML5 Canvas or simple CSS animations to move a "car" `<div>` along a path.
    *   When the car reaches the gate or slot, trigger an API call (`POST /api/scan-rfid`) that updates the slot's `status` to `OCCUPIED`.
    *   The main application UI will poll or use WebSockets to instantly turn that slot red on the map.

---

## Expected Files to Create/Edit

Assuming a standard modern Javascript project structure (e.g., React/Vite or Next.js):

*   `src/index.css` (Global styles, premium design tokens)
*   `src/App.jsx` (Main routing and layout)
*   `src/pages/Login.jsx` (Auth screen)
*   `src/pages/Dashboard.jsx` (Home view)
*   `src/pages/ParkingSelection.jsx` (Lot and slot selection)
*   `src/pages/DigitalTicket.jsx` (Ticket and QR code display)
*   `src/pages/Simulation.jsx` (The visual simulation and RFID trigger)
*   `src/components/ParkingGrid.jsx` (Reusable grid for slots)
*   `src/components/CarAnimation.jsx` (Simulation assets)
*   `src/api/parkingApi.js` (Functions to handle booking and fetching data)
*   `src/api/simulationApi.js` (Functions to mock the hardware RFID scans)
*   `schema.sql` or `firebase.json` (Depending on the chosen DB)

> [!NOTE]
> This plan focuses on creating a high-quality minimum viable product (MVP) for your PUP Manila test. We will prioritize smooth UI micro-animations and a dynamic, responsive design to make a strong impression.

## User Review Required

Please review the updated task distribution and the implementation steps. If you approve this plan, I am ready to start initializing the Next.js project and building the foundation!
