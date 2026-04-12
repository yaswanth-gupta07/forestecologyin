"use client";

import { usePathname } from "next/navigation";
import { HiOutlineMenuAlt2 } from "react-icons/hi";

const pageTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/home": "Home page & site copy",
  "/admin/gallery": "Gallery Management",
  "/admin/research": "Research Management",
  "/admin/team": "Team Management",
  "/admin/collaborators": "Collaborators",
  "/admin/messages": "Contact messages",
};

export default function AdminNavbar({ user, onMenuClick }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Admin";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        >
          <HiOutlineMenuAlt2 className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-700">Admin</p>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">
            {user?.email}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-forest-600 flex items-center justify-center text-white text-sm font-bold">
          {user?.email?.[0]?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
