import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

// Layouts
import AuthLayout from "./app/layouts/AuthLayout";
import StudentLayout from "./app/layouts/StudentLayout";
import AdminLayout from "./app/layouts/AdminLayout";
import PublicLayout from "./app/layouts/PublicLayout";

// Tabs/Pages
import AuthTab from "./pages/auth/AuthTab";
import SettingsTab from "./pages/learner/SettingsTab";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import CourseTab from "./pages/learner/CourseTab";
import CourseDetails from "./pages/learner/CourseDetails";
import CheckoutPage from "./pages/learner/CheckoutPage";
import LearningDashboard from "./pages/learner/LearningDashboard";
import MyLearning from "./pages/learner/MyLearning";
import LandingPage from "./pages/LandingPage";

// Admin Pages
import AdminUsersPage from "./pages/admin/AdminUsersPage";

import { useAuth } from "./features/auth/hooks/useAuth";
import { GuestOnlyRoute, AuthenticatedRoute, RoleRoute } from "./app/router/Guards";

const NavigateToCourse = () => {
  const { courseId } = useParams();
  return <Navigate to={`/courses/${courseId}`} replace />;
};

const App = () => {
  const { profile: currentProfile, profileLoading, fetchProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#F6F4EB] flex items-center justify-center font-outfit select-none">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl font-black text-[#111111] tracking-tight flex items-center"
          >
            Sasta
            <motion.span
              animate={{
                scale: [1, 1.04, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="bg-[#FFE700] text-[#111111] px-2 py-0.5 rounded-lg ml-1 shadow-sm font-black border border-[#E6CF00]/30"
            >
              LMS
            </motion.span>
          </motion.div>

          {/* Pulse Dot Loader */}
          <div className="flex items-center gap-1.5 py-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  y: [0, -6, 0]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.12,
                  ease: "easeInOut"
                }}
                className="w-2.5 h-2.5 rounded-full bg-[#111111]"
              />
            ))}
          </div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-[#111111]/70 font-bold tracking-widest uppercase text-[10px]"
          >
            initializing sastalms...
          </motion.p>
        </div>
      </div>
    );
  }

  const isCreator = currentProfile?.role === "CREATOR";

  const renderPublicRoute = (component) => {
    if (!currentProfile) {
      return <PublicLayout>{component}</PublicLayout>;
    }
    if (isCreator) {
      return <AdminLayout profile={currentProfile} onLogout={handleLogout}>{component}</AdminLayout>;
    }
    return <StudentLayout profile={currentProfile} onLogout={handleLogout}>{component}</StudentLayout>;
  };

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Course Explorer */}
        <Route path="/courses" element={renderPublicRoute(<CourseTab currentProfile={currentProfile} />)} />
        <Route path="/courses/:courseId" element={renderPublicRoute(<CourseDetails currentProfile={currentProfile} />)} />
        <Route path="/my-learning" element={<AuthenticatedRoute>{renderPublicRoute(<MyLearning />)}</AuthenticatedRoute>} />

        {/* Public Auth Route */}
        <Route
          path="/login"
          element={
            <GuestOnlyRoute fallbackPath="/courses">
              <AuthLayout>
                <AuthTab onLoginSuccess={fetchProfile} />
              </AuthLayout>
            </GuestOnlyRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/dashboard/*"
          element={
            <RoleRoute allowedRoles={["STUDENT"]} redirectPath="/courses">
              <StudentLayout profile={currentProfile} onLogout={handleLogout}>
                <Routes>
                  <Route path="courses" element={<Navigate to="/courses" replace />} />
                  <Route path="courses/:courseId" element={<NavigateToCourse />} />
                  <Route path="checkout/:courseId" element={<CheckoutPage currentProfile={currentProfile} />} />
                  <Route path="settings" element={<SettingsTab profile={currentProfile} onLogoutSuccess={handleLogout} />} />
                  <Route path="*" element={<Navigate to="/courses" replace />} />
                </Routes>
              </StudentLayout>
            </RoleRoute>
          }
        />

        {/* Creator / Platform Management Routes - CREATOR only */}
        <Route
          path="/creator/*"
          element={
            <RoleRoute allowedRoles={["CREATOR"]} redirectPath="/courses">
              <AdminLayout profile={currentProfile} onLogout={handleLogout}>
                <Routes>
                  <Route path="courses" element={<CreatorDashboard currentProfile={currentProfile} />} />
                  <Route path="courses/:courseId" element={<NavigateToCourse />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="settings" element={<SettingsTab profile={currentProfile} onLogoutSuccess={handleLogout} />} />
                  <Route path="payments" element={<MyLearning />} />
                  <Route path="*" element={<Navigate to="/creator/users" replace />} />
                </Routes>
              </AdminLayout>
            </RoleRoute>
          }
        />

        {/* Immersive Learning Classroom Route */}
        <Route
          path="/classroom/:courseId"
          element={
            <AuthenticatedRoute>
              <LearningDashboard />
            </AuthenticatedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/courses" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
