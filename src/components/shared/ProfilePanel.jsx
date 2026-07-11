import { useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { makeRequest } from "../../services/api/apiClient";
import {
  X,
  Settings,
  Users,
  CreditCard,
  BookOpen,
  LogOut,
  ChevronRight,
} from "lucide-react";

const ProfilePanel = ({ isOpen, onClose, triggerRef }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const navItemsRef = useRef([]);

  const handleLogout = useCallback(async () => {
    await makeRequest("/user/logout", { method: "POST" });
    if (logout) logout();
    onClose();
  }, [logout, onClose]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus close button on open
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Return focus to trigger on close
  useEffect(() => {
    if (!isOpen && triggerRef?.current) {
      triggerRef.current.focus();
    }
  }, [isOpen, triggerRef]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleTab = (e) => {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Arrow key navigation between nav items
  const handleNavKeyDown = useCallback((e, index) => {
    const items = navItemsRef.current.filter(Boolean);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[index + 1] || items[0];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[index - 1] || items[items.length - 1];
      prev?.focus();
    }
  }, []);

  if (!profile || !isOpen) return null;

  const isCreator = profile.role === "CREATOR";
  const settingsPath = isCreator ? "/creator/settings" : "/dashboard/settings";

  const navItems = isCreator
    ? [
        { name: "Profile & Settings", path: settingsPath, icon: Settings },
        { name: "Users & Stats", path: "/creator/users", icon: Users },
        { name: "Payments", path: "/my-learning", icon: CreditCard },
        { name: "Course Manager", path: "/creator/courses", icon: BookOpen },
      ]
    : [
        { name: "Profile & Settings", path: settingsPath, icon: Settings },
        { name: "My Learning", path: "/my-learning", icon: BookOpen },
      ];

  const isActive = (path) => {
    if (path === "/my-learning") return location.pathname.startsWith("/my-learning");
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Account panel"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-3 sm:right-6 top-14 w-[calc(100vw-24px)] sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl animate-zoom-in-95 overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  isCreator
                    ? "bg-amber-50 border-2 border-amber-200 text-amber-600"
                    : "bg-brand-50 border-2 border-brand-100 text-brand-200"
              }`}
            >
              {profile.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-800 truncate">
                {profile.username}
              </div>
              <div className="text-xs text-slate-400 truncate mt-0.5">
                {profile.email}
              </div>
              <span
                className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isCreator
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : "bg-brand-50 text-brand-200 border border-brand-100"
                }`}
              >
                {profile.role}
              </span>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 -mt-0.5"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-5" />

        {/* Navigation */}
        <nav className="px-3 py-2" aria-label="Account navigation">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                ref={(el) => {
                  navItemsRef.current[index] = el;
                }}
                to={item.path}
                onClick={onClose}
                onKeyDown={(e) => handleNavKeyDown(e, index)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                  active
                    ? "bg-brand-50 text-brand-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
                role="menuitem"
              >
                <Icon
                  size={18}
                  className={active ? "text-brand-200" : "text-slate-400"}
                />
                <span className="flex-1">{item.name}</span>
                <ChevronRight size={14} className="text-slate-300" />
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-5" />

        {/* Footer */}
        <div className="px-3 py-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            role="menuitem"
          >
            <LogOut size={18} className="text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
