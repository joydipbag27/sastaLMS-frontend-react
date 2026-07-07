# veoLMS Frontend Architecture Overview

This document provides a comprehensive technical snapshot of the veoLMS React frontend architecture, directory structure, route registry, state management paradigms, page roles, and detailed application flows.

---

## 1. Directory Structure

The application follows a feature-based architecture pattern to isolate features and separate generic UI primitives from core routes.

- **`src/app/`**: Infrastructure and application configuration layers. Contains root-level layouts (`StudentLayout`, `AdminLayout`, `AuthLayout`, `PublicLayout`), the global state wrapper (`AppProviders`), and route guards (`Guards`).
- **`src/features/`**: Contextual business domains. Each sub-folder houses feature-specific subcomponents and custom hooks:
  - `auth/` — Login, SignUp, and ForgotPassword components.
  - `courses/` — Catalog and syllabus logic hooks (`useCourses`, `useCurriculum`).
  - `learning/` — Student workspace hooks (`useEnrollments`).
  - `account/` — Profile updates and password management tools.
  - `media/` — S3 upload helpers (`FileUpload`, `useMedia`).
- **`src/pages/`**: Route-level entrypoint files serving as controller pages. Persona-specific views are separated into `auth/`, `learner/`, and `creator/` spaces.
- **`src/components/`**: Modular layout blocks divided into:
  - `ui/` — Generic primitives (e.g. `Button`, `Card`, `Input`).
  - `shared/` — Complex layout elements used across multiple features (e.g. `VideoPlayer`, `StepFlow`, `ConsoleLog`).
- **`src/services/`**: Low-level services such as the centralized `api/apiClient.js` client.

---

## 2. Route Registry

Every active frontend path is defined in `src/App.jsx`. Layout wrappers are bound dynamically based on session authentication status:

| Route Path | Page Component | Layout Wrapper | Guard Element | Allowed Roles | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/courses` | `CourseTab` | `PublicLayout` (guest) or `StudentLayout`/`AdminLayout` | None (Public) | All | Browse course catalog |
| `/courses/:courseId` | `CourseDetails` | `PublicLayout` (guest) or `StudentLayout`/`AdminLayout` | None (Public) | All | View curriculum sections and lesson lists |
| `/my-learning` | `MyLearning` | `StudentLayout` (student) or `AdminLayout` (creator) | `AuthenticatedRoute` | All authenticated | Learner's enrolled classrooms dashboard |
| `/login` | `AuthTab` | `AuthLayout` | `GuestOnlyRoute` | Guest (Unauthenticated) | User access console |
| `/dashboard/checkout/:courseId` | `CheckoutPage` | `StudentLayout` | `RoleRoute` | `["STUDENT"]` | Initiate Razorpay paid checkout |
| `/dashboard/settings` | `SettingsTab` | `StudentLayout` | `RoleRoute` | `["STUDENT"]` | Student configuration controls |
| `/admin/media` | `FileTab` | `AdminLayout` | `RoleRoute` | `["CREATOR", "ADMIN"]` | Informational media uploader index |
| `/admin/users` | `RbacTab` | `AdminLayout` | `RoleRoute` | `["CREATOR", "ADMIN"]` | User role manager (Admin-only action) |
| `/admin/settings` | `SettingsTab` | `AdminLayout` | `RoleRoute` | `["CREATOR", "ADMIN"]` | Creator/Admin configuration controls |
| `/classroom/:courseId` | `LearningDashboard` | None (Player Layout) | `AuthenticatedRoute` | All authenticated | Full-screen video playback |

### Proxy Redirects
To prevent edits to legacy components, these paths redirect inside `App.jsx` automatically:
- `/dashboard/courses` → `/courses`
- `/dashboard/courses/:courseId` → `/courses/:courseId`
- `/admin/courses` → `/courses?view=my-courses`
- `/admin/courses/:courseId` → `/courses/:courseId`
- `*` → `/courses`

---

## 3. Route Guards

Guards are defined in `src/app/router/Guards.jsx`. Redirects preserve state using the validated `returnTo` parameters:

- **`GuestOnlyRoute`**: Block authenticated sessions.
  - If a user attempts to access `/login` while logged in, it redirects them to `returnTo` if safe, or defaults to `/admin/courses` (privileged) or `/dashboard/courses` (students).
- **`AuthenticatedRoute`**: Blocks guest access.
  - If a guest attempts access, redirects directly to `/login`.
- **`RoleRoute`**: Enforces specific role access.
  - Prevents non-matching roles. A student accessing creator panels is sent back to `/courses`, whereas a creator accessing student portals redirects to `/courses`.
  - Privileged accounts (creators/admins) retain full access to student paths since layout selection wraps routes dynamically using `renderPublicRoute` inside `App.jsx`.

---

## 4. Authentication Flow

### Session Restoration
On application launch, `useAuth` hook uses TanStack Query to trigger GET `/user` query key `["authProfile"]`. If it successfully returns profile details, the session is restored. If it returns 401, `profile` defaults to `null`. A global `profileLoading` block inside `App.jsx` ensures that page layouts and route guards are not evaluated before session queries finish resolving.

### Redirect Preservation (`returnTo`)
- Guests executing a protected action are navigated to `/login?returnTo=...`
- Once logged in, `GuestOnlyRoute` reads `returnTo`, validates it via `isSafeRedirectPath`, and immediately executes the redirect.
- **Safety Checks**: Paths must start with exactly one `/` and cannot contain backslashes or dangerous syntax characters. Malformed, protocol-relative (`//`), or external (absolute URL) redirect payloads are rejected and fall back safely to default routes.
- **Limitation**: The registration OTP code verification switches users back to the Login sub-tab. Direct `returnTo` navigation is not active inside the registration flow until the user completes sign-in.

---

## 5. Public Course Catalog Flow

Explore Catalog (`/courses`) → Course Details (`/courses/:id`) → Curriculum Metadata (guests and students can browse section headers and lesson items).

### Course Details UI Matrix

| User Context | locked status | Preview Play action | tuition CTA button |
| :--- | :--- | :--- | :--- |
| **Guest User** | locked | Redirects to `/login?returnTo=/classroom/:id?lesson=:id` | "Login to Enroll" / "Login to Buy" |
| **Auth Non-Enrolled Student** | locked | Redirects to classroom video stream directly | "Enroll for Free" / "Buy Course" |
| **Active Enrolled Student** | Unlocked | Redirects to classroom video stream directly | "Continue Learning" |
| **Creator / Admin** | Unlocked | Redirects to classroom video stream directly | "Start Learning (Creator)" |

---

## 6. Enrollment & Checkout Flow

- **Free Enrollment**: If course price is `$0`, authenticated non-enrolled students click "Enroll for Free", triggering the `/course/:id/enroll` POST endpoint. Duplicate requests are blocked programmatically while `enrollLoading` is active.
- **Paid Checkout**: If price is `> $0`, clicking "Buy Course" routes the user to `/dashboard/checkout/:id`.
  1. Frontend calls POST `/payment/order` to create an order.
  2. Razorpay checkout panel overlay launches.
  3. On successful payment, client starts enrollment polling.
- **Polling Lifecycle**: Polls GET `/course/:id/enrollment` at `2s` intervals for up to `15` attempts (`30s` timeout limit). The polling hook invalidates `["enrollments"]` and `["enrollment-check"]` caches immediately on success to show the "Open Classroom" CTA. The polling is automatically cancelled on timeout, errors, or component unmounting.
- **Payment Failures/Dismissals**: Handled cleanly. Status returns to `idle` or `error` with retry buttons.

---

## 7. My Learning Flow

- **Path**: `/my-learning` (Protected by `AuthenticatedRoute`).
- **Data Hook**: `useEnrollments` querying GET `/course/enrollments/me` under query key `["enrollments"]`.
- **Unavailable/Draft Courses**: A student may remain enrolled in a course that a creator returned to `Draft` mode. The course appears on the My Learning dashboard, but is flagged with a **"Course temporarily unavailable"** warning banner. The "Continue Learning" button is disabled to prevent playback access.
- **Completed Status**: Completed enrollments display a "Completed" badge.

---

## 8. Course Player / Classroom Current State (`LearningDashboard.jsx`)

The classroom interface plays video lessons for enrolled learners.

- **Curriculum Loading** [IMPLEMENTED]: Fetches syllabus sections using `useCurriculum(courseId)`.
- **Lesson Selection** [IMPLEMENTED]: Selecting items updates search params `?lesson=id` and updates active lesson state.
- **Lesson Authorization** [IMPLEMENTED]: Client calls GET `/lesson/:id/play` to obtain the HLS `.m3u8` streaming playlist URL.
- **Video.js Setup** [IMPLEMENTED]: Initializes HLS streams using built-in quality level selectors, seek-buttons (+/- 10s), hotkeys, and mobile view configurations.
- **Quality Selection & Hotkeys** [IMPLEMENTED]: Video.js plugins configured correctly inside `VideoPlayer.jsx`.
- **Progress Saving** [IMPLEMENTED]:
  - Debounces position updates (1s delay) on Seek, Pause, visibility change, and page unloads.
  - Periodic save updates every 30s during active playback.
  - Calls POST `/lesson/progress` update hook.
- **401/403 Errors** [PARTIAL]: 401 triggers standard session restoration redirect. 403 on play endpoint sets player state to "error" with plain text error alerts.
- **Draft/Unavailable playback** [PARTIAL]: Playback failures display raw error states rather than user-friendly redirect flows.
- **Security-Sensitive Assumptions** [STALE]: Frontend relies on the backend to enforce authorization. If the backend fails to validate cookies, the player will fail to fetch the HLS stream.

---

## 9. API & Server State Architecture

- **apiClient**: Centralized fetch agent (`src/services/api/apiClient.js`) configuring credentials (`include`) and base URLs. Catches errors and normalizes responses into `{ success, status, data }`.
- **TanStack Query**:
  - `["authProfile"]` — Global user session.
  - `["enrollments"]` — Enrolled courses array.
  - `["enrollment-check", courseId]` — Enrollment verified on checkout.
  - `["sections", courseId, isCreatorOrAdmin]` — Course syllabus.
  - `["lessons", sectionId, isCreatorOrAdmin]` — Section lessons.
  - `["lesson", lessonId]` — Lesson metadata.
- **Direct Cloud Uploads**: Course thumbnails (`CourseTab.jsx`) and video files (`FileUpload.jsx`) bypass the apiClient and use binary `XMLHttpRequest` uploads directly to cloud storage (S3) to track file progress percentage.

---

## 10. Current Page Responsibilities

- **`CourseTab.jsx`**: Manages public catalog browsing, categorizations, and creator dashboards. Responsibility is clean (enrolled list moved out).
- **`CourseDetails.jsx`**: Handles details display, lesson list layouts, and tuition buttons. Responsibility is clean (player moved out).
- **`MyLearning.jsx`**: Manages the learner's enrolled courses list.
- **`CheckoutPage.jsx`**: Dedicated payment page wrapping Razorpay SDK.
- **`LearningDashboard.jsx`**: Dedicated full-screen classroom media player.

---

## 11. Student Flow Status Checklist

- [x] **Explore Courses** [DONE]
- [x] **Course Details** [DONE]
- [x] **Login returnTo** [DONE]
- [x] **Free Enrollment** [DONE]
- [x] **Paid Checkout** [DONE]
- [x] **Enrollment Confirmation** [DONE]
- [x] **My Learning** [DONE]
- [/] **Course Player** [PARTIAL]
  - *Reason*: Player functions work, but custom 403/error UI requires refinement.
- [/] **Protected Lesson Playback** [PARTIAL]
  - *Reason*: Stream requests map properly, but auth error panels are bare.
- [x] **HLS Playback** [DONE]
- [x] **Progress Saving** [DONE]
- [x] **Unavailable Course Handling** [DONE]

---

## 12. Technical Debt / Stale Code

- **S3 Upload Duplication**: Video uploads (`FileUpload.jsx`) and thumbnail uploads (`CourseTab.jsx`) use independent, duplicate implementations of `XMLHttpRequest` S3 upload handlers. These should be combined into a shared hook.
- **Bare Error Panels**: Playback auth errors (403/Draft) inside `LearningDashboard.jsx` render generic text labels instead of styled alert containers.

---

## 13. Next Implementation Phase Recommendations

**Direction**: Refine classroom error transitions and consolidate media uploads.
- **Files to Modify**: `src/pages/learner/LearningDashboard.jsx`, `src/features/media/components/FileUpload.jsx`, `src/pages/learner/CourseTab.jsx`.
- **Implementation Order**:
  1. Add user-friendly warning interfaces inside `LearningDashboard.jsx` to handle unauthorized stream attempts.
  2. Consolidate S3 upload logic into a single hook `useS3Upload` under `src/features/media/hooks/`.
