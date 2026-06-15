# Parqify - PUP Community Parking Management System

Parqify is a modern, real-time web application built for the PUP Community to intelligently manage parking resources, reservations, and digital ticketing.

![Parqify Cover](/public/parqify.png)

## 📸 System Screenshots

|                 User Dashboard                  |                Interactive Parking Lot                 |
| :---------------------------------------------: | :----------------------------------------------------: |
| ![Dashboard](/public/screenshots/dashboard.png) | ![Parking Lot](/public/screenshots/parkinglotpage.png) |

|                 Digital Ticket Confirmation                 |              Active Ticket Page               |
| :---------------------------------------------------------: | :-------------------------------------------: |
| ![Confirmation](/public/screenshots/ticketconfrimation.png) | ![Ticket](/public/screenshots/ticketpage.png) |

|                     Admin Console                      |
| :----------------------------------------------------: |
| ![Admin Console](/public/screenshots/adminconsole.png) |

## ✨ Features

- **Secure Authentication:** JWT and cookie-based Auth using Next.js SSR and Supabase.
- **Interactive Parking Selection:** A beautiful visual grid map of the campus parking lot showing real-time slot availability.
- **Digital Ticketing:** Automatically generated QR code tickets for entry and checkout.
- **Dashboard & Analytics:** Personal dashboards for users, integrated with Vercel Analytics for usage metrics.
- **Parqibot Assistant:** A floating interactive Chatbot to help users with common questions.
- **Premium Design System:** Uses PUP's official Maroon and Gold branding with smooth micro-animations.

## 🛠️ Technology Stack

- **Framework:** [Next.js 14 App Router](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics)
- **Deployment:** Vercel

## 💻 Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` file with Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## 👥 The Team

- **Christian Abelarde** - Frontend Developer (Auth & Dashboard) • [GitHub](https://github.com/Imajoker22)
- **Elizander Aguila** - Project Manager / Lead Backend Developer • [GitHub](https://github.com/cassinimeow)
- **Marc Kelwin Bulic** - QA & Hardware/Accessibility Integration • [GitHub](https://github.com/marckelwinbulic-beep)
- **Johann Mcwee Dinaya** - Frontend Developer (Interactive Selection UI) • [GitHub](https://github.com/yohannmcdi)
- **Edrian Juampit** - Frontend Developer (Digital Ticket System) • [GitHub](https://github.com/delriooo)
- **Xyra Mayo** - UI/UX Designer & QA • [GitHub](https://github.com/xjamayo)
