"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlinePhotograph,
  HiOutlineBeaker,
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineUserAdd,
  HiOutlineMail,
} from "react-icons/hi";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HiOutlineHome },
  { name: "Home page", href: "/admin/home", icon: HiOutlineDocumentText },
  { name: "Gallery", href: "/admin/gallery", icon: HiOutlinePhotograph },
  { name: "Research", href: "/admin/research", icon: HiOutlineBeaker },
  { name: "Team", href: "/admin/team", icon: HiOutlineUserGroup },
  { name: "Collaborators", href: "/admin/collaborators", icon: HiOutlineUserAdd },
  { name: "Messages", href: "/admin/messages", icon: HiOutlineMail },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-forest-700 text-white flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h1 className="text-lg font-bold tracking-wide">
              Forest Ecology
            </h1>
            <p className="text-xs text-white/50 mt-0.5">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${
                    active
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium
              text-white/65 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150"
          >
            <HiOutlineLogout className="w-5 h-5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
