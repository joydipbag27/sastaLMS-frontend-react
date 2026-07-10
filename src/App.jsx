import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";

// Layouts
import AuthLayout from "./app/layouts/AuthLayout";
import StudentLayout from "./app/layouts/StudentLayout";
import AdminLayout from "./app/layouts/AdminLayout";
import PublicLayout from "./app/layouts/PublicLayout";

// Tabs/Pages
import AuthTab from "./pages/auth/AuthTab";
import SettingsTab from "./pages/learner/SettingsTab";
import RbacTab from "./pages/creator/RbacTab";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import CourseTab from "./pages/learner/CourseTab";
import CourseDetails from "./pages/learner/CourseDetails";
import CheckoutPage from "./pages/learner/CheckoutPage";
import LearningDashboard from "./pages/learner/LearningDashboard";
import MyLearning from "./pages/learner/MyLearning";

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
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-650 font-bold tracking-widest uppercase text-xs font-outfit">Loading veoLMS</p>
        </div>
      </div>
    );
  }

  const isCreatorOrAdmin = currentProfile?.role === "CREATOR" || currentProfile?.role === "ADMIN";

  const renderPublicRoute = (component) => {
    if (!currentProfile) {
      return <PublicLayout>{component}</PublicLayout>;
    }
    if (isCreatorOrAdmin) {
      return <AdminLayout profile={currentProfile} onLogout={handleLogout}>{component}</AdminLayout>;
    }
    return <StudentLayout profile={currentProfile} onLogout={handleLogout}>{component}</StudentLayout>;
  };

  return (
    <Router>
      <Routes>
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

        {/* Admin/Creator Routes */}
        <Route 
          path="/admin/*" 
          element={
            <RoleRoute allowedRoles={["CREATOR", "ADMIN"]} redirectPath="/courses">
              <AdminLayout profile={currentProfile} onLogout={handleLogout}>
                <Routes>
                  <Route path="courses" element={<CreatorDashboard currentProfile={currentProfile} />} />
                  <Route path="courses/:courseId" element={<NavigateToCourse />} />
                  <Route path="users" element={<RbacTab currentProfile={currentProfile} />} />
                  <Route path="settings" element={<SettingsTab profile={currentProfile} onLogoutSuccess={handleLogout} />} />
                  <Route path="*" element={<Navigate to="/courses" replace />} />
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