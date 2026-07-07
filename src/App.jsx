import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "./app/layouts/AuthLayout";
import StudentLayout from "./app/layouts/StudentLayout";
import AdminLayout from "./app/layouts/AdminLayout";

// Tabs/Pages
import AuthTab from "./pages/auth/AuthTab";
import SettingsTab from "./pages/learner/SettingsTab";
import RbacTab from "./pages/creator/RbacTab";
import FileTab from "./pages/creator/FileTab";
import CourseTab from "./pages/learner/CourseTab";
import CourseDetails from "./pages/learner/CourseDetails";
import CheckoutPage from "./pages/learner/CheckoutPage";
import LearningDashboard from "./pages/learner/LearningDashboard";

import { useAuth } from "./features/auth/hooks/useAuth";

const App = () => {
  const { profile: currentProfile, profileLoading, fetchProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sky-400 font-bold tracking-widest uppercase text-sm">Loading veoLMS</p>
        </div>
      </div>
    );
  }


  const isCreatorOrAdmin = currentProfile?.role === "CREATOR" || currentProfile?.role === "ADMIN";

  return (
    <Router>
      <Routes>
        {/* Public Auth Route */}
        <Route 
          path="/login" 
          element={
            currentProfile ? (
              <Navigate to={isCreatorOrAdmin ? "/admin/courses" : "/dashboard/courses"} replace />
            ) : (
              <AuthLayout>
                <AuthTab onLoginSuccess={fetchProfile} />
              </AuthLayout>
            )
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/dashboard/*" 
          element={
            !currentProfile ? (
              <Navigate to="/login" replace />
            ) : isCreatorOrAdmin ? (
               <Navigate to="/admin/courses" replace />
            ) : (
              <StudentLayout profile={currentProfile} onLogout={handleLogout}>
                <Routes>
                  <Route path="courses" element={<CourseTab currentProfile={currentProfile} />} />
                  <Route path="courses/:courseId" element={<CourseDetails currentProfile={currentProfile} />} />
                  <Route path="checkout/:courseId" element={<CheckoutPage currentProfile={currentProfile} />} />
                  <Route path="settings" element={<SettingsTab profile={currentProfile} onLogoutSuccess={handleLogout} />} />
                  <Route path="*" element={<Navigate to="courses" replace />} />
                </Routes>
              </StudentLayout>
            )
          } 
        />

        {/* Admin/Creator Routes */}
        <Route 
          path="/admin/*" 
          element={
            !currentProfile ? (
              <Navigate to="/login" replace />
            ) : !isCreatorOrAdmin ? (
              <Navigate to="/dashboard/courses" replace />
            ) : (
              <AdminLayout profile={currentProfile} onLogout={handleLogout}>
                <Routes>
                  <Route path="courses" element={<CourseTab currentProfile={currentProfile} defaultViewMode="my-courses" />} />
                  <Route path="courses/:courseId" element={<CourseDetails currentProfile={currentProfile} />} />
                  <Route path="media" element={<FileTab currentProfile={currentProfile} />} />
                  <Route path="users" element={<RbacTab currentProfile={currentProfile} />} />
                  <Route path="settings" element={<SettingsTab profile={currentProfile} onLogoutSuccess={handleLogout} />} />
                  <Route path="*" element={<Navigate to="courses" replace />} />
                </Routes>
              </AdminLayout>
            )
          } 
        />

        {/* Immersive Learning Classroom Route */}
        <Route
          path="/classroom/:courseId"
          element={
            !currentProfile ? (
              <Navigate to="/login" replace />
            ) : (
              <LearningDashboard />
            )
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;