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
import DocsPage from "./pages/docs/DocsPage";

// Admin Pages
import AdminUsersPage from "./pages/admin/AdminUsersPage";

import { useAuth } from "./features/auth/hooks/useAuth";
import { GuestOnlyRoute, AuthenticatedRoute, RoleRoute } from "./app/router/Guards";

import LoadingScreen from "./components/shared/LoadingScreen";

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
        <LoadingScreen minHeight="min-h-fit" message="initializing sastalms..." />
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
        <Route path="/docs" element={<DocsPage />} />

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
