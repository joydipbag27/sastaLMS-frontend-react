# SastaLMS Frontend Client

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.0-purple.svg)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#license)

SastaLMS is a production-ready, open-source Learning Management System (LMS) designed for independent content creators, educators, and self-hosters. This repository contains the modern single-page React client, featuring a high-performance video player, responsive dashboards, secure role-based navigation, and payment integrations.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Available Scripts](#available-scripts)
- [Architecture & Application Flows](#architecture--application-flows)
  - [Route Registry](#route-registry)
  - [Route Guards & Redirection](#route-guards--redirection)
  - [Authentication Flow](#authentication-flow)
  - [Course Details & Catalog Flow](#course-details--catalog-flow)
  - [Enrollment & Checkout Flow](#enrollment--checkout-flow)
  - [Classroom Video Player Flow](#classroom-video-player-flow)
- [State Management & API Client](#state-management--api-client)
- [Development Checklist & Status](#development-checklist--status)
- [Design Principles](#design-principles)
- [Deployment Notes](#deployment-notes)
- [Related Repository](#related-repository-backend)
- [License](#license)

---

## Features

- **Immersive Video Player**: Powered by Plyr.js and HLS.js for adaptive bitrate streaming, custom speed options, hotkeys, and automated progress saving.
- **Dynamic Catalog Explorer**: Public routes for non-authenticated guests to search courses and inspect curriculum syllabus items.
- **Creator Dashboard**: Unified creation interface for drafts, pricing options, thumbnail configuration, and interactive syllabus structuring.
- **Razorpay Secure Checkout**: Integrated with the Razorpay SDK overlay alongside status verification polling.
- **Google OAuth Login**: Standard social login and authentication flow support.
- **Role-Based Navigation**: Responsive layouts customized for guests, students (`STUDENT`), and instructors (`CREATOR`).

---

## Tech Stack

*   **Core Framework**: React 19, Vite (build engine), React Router DOM v7 (routing).
*   **State & Data Cache**: TanStack React Query v5 (efficient server state synchronization and caching).
*   **Styling & UI**: Tailwind CSS v3 (modern utilities), Lucide React (system icons).
*   **Animations**: Framer Motion (page transitions and micro-interactions), GSAP (complex interactive elements).
*   **Media Playback**: HLS.js (HTTP Live Streaming parser) + Plyr.js (HTML5 media shell wrapper).

---

## Project Structure

```text
src/
├── app/                  # Application architecture & configurations
│   ├── layouts/          # Dynamic layouts (Public, Student, Admin, Auth)
│   ├── providers/        # Context providers (Auth, QueryClient, Google OAuth)
│   └── router/           # Route registry and Route Guards (GuestOnly, Authenticated, RoleRoute)
├── components/           # Reusable UI elements
│   ├── docs/             # Specs and system topographies
│   ├── landing/          # Home landing page sections
│   ├── shared/           # Complex components (VideoPlayer, ConsoleLog, LoadingScreen)
│   └── ui/               # Core atomic primitives (Button, Card, Input)
├── features/             # Business domain logical structures
│   ├── account/          # Profile setups and credentials
│   ├── admin/            # RBAC utilities and creators admin hooks
│   ├── auth/             # Session contexts and registration flows
│   ├── courses/          # Syllabus catalog caches and metadata hooks
│   ├── learning/         # Enrolled course dashboards and classroom trackers
│   └── media/            # S3 client upload triggers (useS3Upload)
├── pages/                # Route entry views
│   ├── admin/            # Platform-wide administration (AdminUsersPage)
│   ├── auth/             # Login & SignUp tab controls
│   ├── creator/          # Instructor dashboards (CreatorDashboard, FileTab, RbacTab)
│   ├── docs/             # SastaLMS technical documentation (DocsPage)
│   ├── learner/          # Student routes (CheckoutPage, CourseDetails, LearningDashboard)
│   └── LandingPage.jsx   # Root home landing view
├── services/             # Low-level infrastructure clients
│   └── api/              # Normalized API Client (apiClient.js)
├── main.jsx              # Application bootstrap entry point
└── App.jsx               # Navigation router mapping and state controllers
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation

1.  Clone this repository to your local system:
    ```bash
    git clone https://github.com/joydipbag27/sastaLMS-frontend-react.git
    cd sastaLMS-frontend-react
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Configure your environment variables by creating `.env` files in the root folder.

#### Local Development (`.env.development`)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_DEMO_VIDEO_URL=https://your-s3-bucket-url/demo.m3u8
VITE_DEMO_VIDEO_POSTER=https://your-s3-bucket-url/poster.png
```

#### Production (`.env.production`)
```env
VITE_API_BASE_URL=https://api.sastalms.sbs
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_DEMO_VIDEO_URL=https://your-s3-bucket-url/demo.m3u8
VITE_DEMO_VIDEO_POSTER=https://your-s3-bucket-url/poster.png
```

### Available Scripts

*   `npm run dev`: Starts the local Vite development server with Hot Module Replacement (HMR).
*   `npm run build`: Compiles the application into highly optimized static assets in the `dist/` directory.
*   `npm run lint`: Analyzes the source code using ESLint for style rules and syntax warnings.
*   `npm run preview`: Spins up a local web server to preview the production-ready build in `dist/` for testing.

---

## Architecture & Application Flows

### Route Registry

Routes are managed inside `src/App.jsx`. Layout wrappers are bound dynamically based on session authentication status:

| Route Path | Page Component | Layout Wrapper | Guard Element | Allowed Roles | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `LandingPage` | None | None | All | Public landing page |
| `/docs` | `DocsPage` | None | None | All | Technical specification docs |
| `/courses` | `CourseTab` | Dynamic Layout | None (Public) | All | Browse public course catalog |
| `/courses/:courseId` | `CourseDetails` | Dynamic Layout | None (Public) | All | View curriculum syllabus preview |
| `/my-learning` | `MyLearning` | Dynamic Layout | `AuthenticatedRoute` | All authenticated | Learner's enrolled dashboard |
| `/login` | `AuthTab` | `AuthLayout` | `GuestOnlyRoute` | Guest | User credentials portal |
| `/dashboard/checkout/:courseId` | `CheckoutPage` | `StudentLayout` | `RoleRoute` | `["STUDENT"]` | Paid enrollment transaction checkout |
| `/dashboard/settings` | `SettingsTab` | `StudentLayout` | `RoleRoute` | `["STUDENT"]` | Student configuration panel |
| `/creator/courses` | `CreatorDashboard` | `AdminLayout` | `RoleRoute` | `["CREATOR"]` | Instructor course manager dashboard |
| `/creator/users` | `AdminUsersPage` | `AdminLayout` | `RoleRoute` | `["CREATOR"]` | Platform RBAC role manager panel |
| `/creator/settings` | `SettingsTab` | `AdminLayout` | `RoleRoute` | `["CREATOR"]` | Instructor configuration panel |
| `/creator/payments` | `MyLearning` | `AdminLayout` | `RoleRoute` | `["CREATOR"]` | Creator earnings and history list |
| `/classroom/:courseId` | `LearningDashboard` | None | `AuthenticatedRoute` | Enrolled Students | Full-screen video classroom theater |

#### Legacy Proxy Redirects
Vite redirects proxy routes automatically inside `App.jsx` to prevent broken routes:
- `/dashboard/courses` → `/courses`
- `/dashboard/courses/:courseId` → `/courses/:courseId`
- `/creator/courses/:courseId` → `/courses/:courseId`

### Route Guards & Redirection

Guards are defined in `src/app/router/Guards.jsx`. Redirects preserve navigation states using `returnTo` search parameters:

*   **`GuestOnlyRoute`**: Rejects authenticated users. Redirects logged-in creators to `/creator/users` and students to `/dashboard/courses` (which resolves to `/courses`).
*   **`AuthenticatedRoute`**: Rejects guest users and forces navigation back to `/login`.
*   **`RoleRoute`**: Enforces role constraints. Redirects non-matching roles to their respective default home bases.
*   **Redirect Parameters & Validation**:
    *   Guests trying to execute private actions are redirected to `/login?returnTo=...`
    *   On successful authentication, `GuestOnlyRoute` checks for the parameter, validates it via `isSafeRedirectPath` (preventing open redirects, absolute protocols, protocol-relative prefixes `//`, or malformed URI characters), and triggers the redirection.

### Authentication Flow

*   **Session Restoration**: On launch, the `useAuth` hook uses TanStack Query to trigger `GET /user` under query key `["authProfile"]`. If it resolves successfully, the session is restored. A 401 response sets the profile state to `null`.
*   **Blocking Initializers**: A global `profileLoading` overlay prevents router elements and page layouts from flashing or evaluating before the authorization check resolves.

### Course Details & Catalog Flow

Explore Catalog (`/courses`) → Course Details (`/courses/:id`) → Curriculum Metadata (guests and students can browse section headers and lesson items).

#### Catalog Details Layout Matrix
The "Course Details" page dynamically customizes action flows according to active session context:

| User Context | Lesson Locked Status | Play Action | Main Tuition CTA Button |
| :--- | :--- | :--- | :--- |
| **Guest / Anonymous User** | Locked | Redirects to `/login?returnTo=/classroom/:id?lesson=:id` | "Login to Enroll" / "Login to Buy" |
| **Non-Enrolled Student** | Locked | Redirects to checkout or enrollment | "Enroll for Free" / "Buy Course" |
| **Enrolled Student** | Unlocked | Launches video player viewport directly | "Continue Learning" |
| **Creator / Instructor** | Unlocked | Launches video player viewport directly | "Start Learning (Creator)" |

### Enrollment & Checkout Flow

*   **Free Enrollment**: Clicking "Enroll for Free" fires a POST request to `/course/:id/enroll`. Action state mutations are blocked by an active `enrollLoading` indicator.
*   **Paid Checkout**: Runs an on-demand injection of the Razorpay library (`https://checkout.razorpay.com/v1/checkout.js`). Successful client-side callbacks trigger checkout status polling.
*   **Checkout Polling**: Polls the enrollment validation endpoint `GET /course/:id/enrollment` at `2s` intervals (caps at 15 attempts, `30s` timeout) to verify backend database synchronization before clearing checkout screens.

### Classroom Video Player Flow

Enrolled users stream lessons inside an interactive media layout (`LearningDashboard.jsx`):
*   **Video.js & HLS Integration**: Built using `Plyr.js` bound to an `HLS.js` instance inside `VideoPlayer.jsx`. Available manifests are parsed on load to dynamically fetch variant height indices and construct adaptive quality options in the player settings.
*   **Hotkeys & UI Options**: Standard keyboard listeners control playback (spacebar toggles play/pause, arrows adjust seek offsets and volume).
*   **Playback Progress Synchronization**:
    *   Saves active position index to `POST /lesson/progress`.
    *   Trigger frequency: Debounced on user seek / pause events (1s), periodically during active play (30s intervals), and on window unmount or page visibility changes.

---

## State Management & API Client

*   **API client (`src/services/api/apiClient.js`)**: Implements normalized server fetch wrapper. Configures request credential tracking (`include`) and unwraps backend envelopes, flattening structural properties for state consumption:
    ```javascript
    // Flattens backend: { success, message, data: {...}, error }
    normalizedData = {
      ...(responseData.data || {}),
      message: responseData.message,
      error: responseData.error,
      success: responseData.success,
    };
    ```
*   **Query Caches (TanStack Query Keys)**:
    *   `["authProfile"]` — Session authentication metadata.
    *   `["courses"]` — Main courses list index.
    *   `["course", courseId]` — Single course detailed specs.
    *   `["sections", courseId, isCreator]` — Course syllabus curriculum.
    *   `["enrollments"]` — Enrolled classrooms array list.
    *   `["enrollment-check", courseId]` — Validation for checkout.

---

## Development Checklist & Status

### Core Features Checklist
- [x] **Catalog Browsing**: Course detail preview routes.
- [x] **Role Redirection**: Guest safe redirects using `returnTo`.
- [x] **Razorpay Core Checkout**: Script injector and polling.
- [x] **Responsive Course Player**: Immersive classroom viewport.
- [x] **Adaptive Streaming**: HLS manifest parser with Plyr quality controls.
- [x] **Progress Syncing**: Real-time position checkpoint persistence.
- [x] **Unavailable Content Protection**: Draft indicator overlays for invalid access.

---

## Design Principles

*   **HSL Palette UI**: Clean dark frames, high contrast highlight cards (`#FFE700`), customized buttons, and sleek borders.
*   **Micro-animations**: Dynamic interactive motion states controlled via `Framer Motion` and custom GSAP routines.
*   **Typography**: Outfitted with Inter and Outfit typefaces for optimal scan-readability.

---

## Deployment Notes

*   **Production Bundle**: Compiles down to static files inside the `/dist` output folder.
*   **Routing Fallbacks**: Make sure your static asset manager (NGINX, S3, Netlify, Cloudflare) redirects non-file requests to `index.html` (HTML5 routing fallback) to prevent 404s on deep-linked page routes.

---

## Related Repository (Backend)

For backend configurations, API architectures, database models, AWS MediaConvert settings, edge worker HMAC signature verification mechanisms, and payment fulfillments, please view the [SastaLMS Backend Repository](https://github.com/joydipbag27/sastaLMS-backend).

---

## License

This project is licensed under the MIT License. See individual repository files for details.
