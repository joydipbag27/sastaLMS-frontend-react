import { useState, useEffect, useRef } from "react";
import { Loader2, Search, ShieldCheck, LogOut, Ban, CheckCircle, AlertTriangle, Trash2, ChevronDown, X, Users, UserCheck, BookOpen, FileText, Eye, FileEdit } from "lucide-react";
import { useAdminUsers, useUserSessionStatus, useForceLogout, useToggleBlock, usePromoteUser, useDeleteUser, useAdminSummary } from "../../features/admin/hooks/useAdmin";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-xs font-bold animate-slide-up ${
      type === "success"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : type === "error"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      {type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-current opacity-50 hover:opacity-100">
        <X size={12} />
      </button>
    </div>
  );
};

const Modal = ({ title, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md animate-zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 font-outfit">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, iconColor }) => (
  <div className="bg-white border border-slate-200 shadow-sm rounded-xl flex items-center gap-3 px-4 py-3">
    <div className={`shrink-0 rounded-lg flex items-center justify-center w-8 h-8 ${iconColor}`}>
      <Icon size={15} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-outfit truncate">{label}</p>
      <p className="font-black text-slate-800 tracking-tight font-outfit text-lg">{value}</p>
    </div>
  </div>
);

const AdminUsersPage = () => {
  const [toast, setToast] = useState(null);
  const [sessionModalUser, setSessionModalUser] = useState(null);
  const [promoteModalUser, setPromoteModalUser] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [logoutModalUser, setLogoutModalUser] = useState(null);
  const [blockModalUser, setBlockModalUser] = useState(null);

  const {
    users,
    isLoading,
    error,
    hasMore,
    loadMore,
    isFetchingNextPage,
    refetch,
  } = useAdminUsers(15);

  const { data: summary } = useAdminSummary();

  const sessionStatus = useUserSessionStatus();
  const forceLogout = useForceLogout();
  const toggleBlock = useToggleBlock();
  const promoteUser = usePromoteUser();
  const deleteUserMut = useDeleteUser();

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleCheckSession = async (user) => {
    setSessionModalUser({ user, loading: true });
    try {
      const data = await sessionStatus.mutateAsync(user._id);
      setSessionModalUser({ user, isLoggedIn: data.isLoggedIn, loading: false });
    } catch (err) {
      showToast(err.message || "Failed to check session", "error");
      setSessionModalUser(null);
    }
  };

  const handleForceLogout = async () => {
    if (!logoutModalUser) return;
    try {
      await forceLogout.mutateAsync(logoutModalUser._id);
      showToast(`Sessions terminated for ${logoutModalUser.username}`);
      if (sessionModalUser?.user._id === logoutModalUser._id) {
        setSessionModalUser(null);
      }
      setLogoutModalUser(null);
    } catch (err) {
      showToast(err.message || "Failed to force logout", "error");
    }
  };

  const handleBlockToggle = async () => {
    if (!blockModalUser) return;
    const action = blockModalUser.isBlocked ? "unblock" : "block";
    try {
      await toggleBlock.mutateAsync(blockModalUser._id);
      showToast(`User ${action}ed successfully`);
      if (sessionModalUser?.user._id === blockModalUser._id) {
        setSessionModalUser(null);
      }
      setBlockModalUser(null);
    } catch (err) {
      showToast(err.message || `Failed to ${action} user`, "error");
    }
  };

  const handlePromoteUser = async () => {
    if (!promoteModalUser) return;
    try {
      await promoteUser.mutateAsync(promoteModalUser._id);
      showToast(`${promoteModalUser.username} has been promoted to Creator`);
      if (sessionModalUser?.user._id === promoteModalUser._id) {
        setSessionModalUser(null);
      }
      setPromoteModalUser(null);
    } catch (err) {
      showToast(err.message || "Failed to promote user", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    try {
      await deleteUserMut.mutateAsync(deleteModalUser._id);
      showToast(`${deleteModalUser.username} has been deleted`);
      if (sessionModalUser?.user._id === deleteModalUser._id) {
        setSessionModalUser(null);
      }
      setDeleteModalUser(null);
    } catch (err) {
      showToast(err.message || "Failed to delete user", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight font-outfit">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage platform users, roles, access, and active sessions</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-3 w-36 bg-slate-100 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-3 w-14 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-16">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight font-outfit">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage platform users, roles, access, and active sessions</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 text-center space-y-3">
          <p className="text-sm text-slate-500">Failed to load users.</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-200 text-[#111111] hover:bg-brand-300 text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-xl font-black text-slate-800 tracking-tight font-outfit">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage platform users, roles, access, and active sessions</p>
      </div>

      {/* Metrics Section */}
      {summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <MetricCard label="Total Users" value={summary.totalUsers ?? 0} icon={Users} iconColor="bg-brand-50 text-brand-200" />
          <MetricCard label="Enrolled Users" value={summary.enrolledUsers ?? 0} icon={UserCheck} iconColor="bg-emerald-50 text-emerald-600" />
          <MetricCard label="Enrollments" value={summary.totalEnrollments ?? 0} icon={BookOpen} iconColor="bg-brand-50 text-brand-200" />
          <MetricCard label="Total Courses" value={summary.totalCourses ?? 0} icon={FileText} iconColor="bg-brand-50 text-brand-200" />
          <MetricCard label="Published" value={summary.publishedCourses ?? 0} icon={Eye} iconColor="bg-emerald-50 text-emerald-600" />
          <MetricCard label="Draft" value={summary.draftCourses ?? 0} icon={FileEdit} iconColor="bg-amber-50 text-amber-600" />
          <MetricCard label="Blocked" value={summary.blockedUsers ?? 0} icon={Ban} iconColor="bg-rose-50 text-rose-600" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 animate-pulse">
          {[...Array(7)].map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl h-[60px]" />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl text-center py-16 bg-slate-50/50">
            <Users size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No users to manage</p>
            <p className="text-xs text-slate-400 mt-1">Other user accounts will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Headers row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 text-[10px] font-bold text-slate-450 uppercase tracking-wider font-outfit hidden md:grid">
              <div className="col-span-4">User Details</div>
              <div className="col-span-2 text-center">Role</div>
              <div className="col-span-3 text-center">Status</div>
              <div className="col-span-3 text-right pr-4">Actions</div>
            </div>

            {/* Cards List */}
            {users.map((user) => (
              <div
                key={user._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 items-center hover:border-brand-100 hover:shadow-md transition-all duration-200"
              >
                {/* User Details */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 border-brand-100 text-brand-200 flex items-center justify-center font-bold text-sm shrink-0">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-850 text-sm truncate leading-snug">{user.username}</p>
                    <p className="text-slate-450 font-mono text-[10px] truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-2 flex flex-col items-center justify-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200 uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>

                {/* Status & Check Session */}
                <div className="col-span-3 flex flex-col items-center justify-center gap-1.5">
                  <div>
                    {user.isBlocked ? (
                      <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        Blocked
                      </span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                        Active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCheckSession(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold transition-all border border-slate-250 cursor-pointer"
                  >
                    <Search size={11} className="text-slate-450" />
                    Check Status
                  </button>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex items-center justify-end gap-2 pr-2">
                  <div className="relative group">
                    <button
                      onClick={() => setLogoutModalUser(user)}
                      className="p-2 rounded-xl text-slate-450 hover:text-brand-200 hover:bg-brand-50 hover:border-brand-100 transition-all border border-transparent shadow-sm bg-slate-50/50 cursor-pointer"
                      aria-label="Force Logout"
                    >
                      <LogOut size={13} />
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-800 text-[9px] text-white font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap z-40 shadow-md border border-slate-700 font-outfit">
                      Force Logout
                    </span>
                  </div>

                  <div className="relative group">
                    <button
                      onClick={() => setBlockModalUser(user)}
                      className={`p-2 rounded-xl border border-transparent transition-all shadow-sm bg-slate-50/50 cursor-pointer ${
                        user.isBlocked
                          ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-150"
                          : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-150"
                      }`}
                      aria-label={user.isBlocked ? "Unblock User" : "Block User"}
                    >
                      <Ban size={13} />
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-800 text-[9px] text-white font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap z-40 shadow-md border border-slate-700 font-outfit">
                      {user.isBlocked ? "Unblock User" : "Block User"}
                    </span>
                  </div>

                  <div className="relative group">
                    <button
                      onClick={() => setPromoteModalUser(user)}
                      className="p-2 rounded-xl text-slate-450 hover:text-brand-200 hover:bg-brand-50 hover:border-brand-100 transition-all border border-transparent shadow-sm bg-slate-50/50 cursor-pointer"
                      aria-label="Promote to Creator"
                    >
                      <ShieldCheck size={13} />
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-800 text-[9px] text-white font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap z-40 shadow-md border border-slate-700 font-outfit">
                      Promote to Creator
                    </span>
                  </div>

                  <div className="relative group">
                    <button
                      onClick={() => setDeleteModalUser(user)}
                      className="p-2 rounded-xl text-slate-450 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-150 transition-all border border-transparent shadow-sm bg-slate-50/50 cursor-pointer"
                      aria-label="Delete User"
                    >
                      <Trash2 size={13} />
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-800 text-[9px] text-white font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap z-40 shadow-md border border-slate-700 font-outfit">
                      Delete User
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="pt-2">
            <button
              onClick={() => loadMore()}
              disabled={isFetchingNextPage}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Load More
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Session Status Modal */}
      {sessionModalUser && (
        <Modal title="Session Status" onClose={() => setSessionModalUser(null)}>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-50 border-brand-100 text-brand-200 flex items-center justify-center font-bold text-xs">
                {sessionModalUser.user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{sessionModalUser.user.username}</p>
                <p className="text-[11px] text-slate-400">{sessionModalUser.user.email}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${
              sessionModalUser.loading
                ? "bg-slate-50 border-slate-200 text-slate-500"
                : sessionModalUser.isLoggedIn
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-500"
            }`}>
              {sessionModalUser.loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : sessionModalUser.isLoggedIn ? (
                <CheckCircle size={14} />
              ) : (
                <Ban size={14} />
              )}
              <span className="text-xs font-bold">
                {sessionModalUser.loading
                  ? "Checking..."
                  : sessionModalUser.isLoggedIn
                    ? "Active Session"
                    : "No Active Session"}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Force Logout Confirmation Modal */}
      {logoutModalUser && (
        <Modal title="Force Logout" onClose={() => setLogoutModalUser(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 text-amber-650 flex items-center justify-center font-bold text-xs">
                {logoutModalUser.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{logoutModalUser.username}</p>
                <p className="text-[11px] text-slate-400">{logoutModalUser.email}</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-amber-700 font-medium">
                Are you sure you want to force logout this user? All active sessions will be terminated and invalidated in Redis.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleForceLogout}
                disabled={forceLogout.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-650 hover:bg-amber-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forceLogout.isPending && <Loader2 size={12} className="animate-spin" />}
                Confirm Logout
              </button>
              <button
                onClick={() => setLogoutModalUser(null)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Block/Unblock Confirmation Modal */}
      {blockModalUser && (
        <Modal title={blockModalUser.isBlocked ? "Unblock User" : "Block User"} onClose={() => setBlockModalUser(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                {blockModalUser.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{blockModalUser.username}</p>
                <p className="text-[11px] text-slate-400">{blockModalUser.email}</p>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-rose-700 font-medium">
                {blockModalUser.isBlocked
                  ? "Are you sure you want to unblock this user? They will be able to log back into SastaLMS."
                  : "Are you sure you want to block this user? They will be force-logged out and locked out of SastaLMS."}
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleBlockToggle}
                disabled={toggleBlock.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {toggleBlock.isPending && <Loader2 size={12} className="animate-spin" />}
                Confirm
              </button>
              <button
                onClick={() => setBlockModalUser(null)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Promote to Creator Modal */}
      {promoteModalUser && (
        <Modal title="Promote to Creator" onClose={() => setPromoteModalUser(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-50 border-brand-100 text-brand-200 flex items-center justify-center font-bold text-xs">
                {promoteModalUser.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{promoteModalUser.username}</p>
                <p className="text-[11px] text-slate-400">{promoteModalUser.email}</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-amber-700 font-medium">
                Are you sure you want to promote this user to Creator? This grants them full course creation and platform administration permissions. <strong>This action is irreversible.</strong>
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handlePromoteUser}
                disabled={promoteUser.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-200 text-[#111111] hover:bg-brand-300 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {promoteUser.isPending && <Loader2 size={12} className="animate-spin" />}
                Promote User
              </button>
              <button
                onClick={() => setPromoteModalUser(null)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalUser && (
        <Modal title="Delete User" onClose={() => setDeleteModalUser(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                {deleteModalUser.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{deleteModalUser.username}</p>
                <p className="text-[11px] text-slate-400">{deleteModalUser.email}</p>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-rose-700 font-medium">
                This action is permanent and cannot be undone. The user account and all associated data will be removed.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleDeleteUser}
                disabled={deleteUserMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteUserMut.isPending && <Loader2 size={12} className="animate-spin" />}
                Delete User
              </button>
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsersPage;
