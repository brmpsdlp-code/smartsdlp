"use client";

import kemEntanLogo from "@/imports/Kementerian_Pertanian_Kementan_Logo.svg";
import { signOut } from "@/lib/auth-client";
import { MenuItem, Role, UserProfile } from "@/types";
import { EditProfileModal } from "./EditProfileModal";
import { User, LogOut, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icons } from "@/utils/formatters";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const userMenu: MenuItem[] = [
  {
    id: "dashboard",
    label: "Beranda",
    icon: Icons.home,
    path: "/dashboard",
  },
  { id: "input", label: "Input Laporan", icon: Icons.fileEdit, path: "/input" },
];

const adminMenu: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Icons.dashboard,
    path: "/admin/dashboard",
  },
  {
    id: "master",
    label: "Kegiatan",
    icon: Icons.users,
    path: "/admin/master",
  },
  {
    id: "users",
    label: "Pengguna",
    icon: Icons.user,
    path: "/admin/users",
  },
  {
    id: "repositori",
    label: "Dokumen",
    icon: Icons.archive,
    path: "/admin/repositori",
  },
  {
    id: "arsip-sp2d",
    label: "Arsip",
    icon: Icons.excel,
    path: "/admin/arsip-sp2d",
  },
  {
    id: "log-audit",
    label: "Log Audit",
    icon: Icons.trash,
    path: "/admin/log-audit",
  },
  {
    id: "cetak",
    label: "Cetak",
    icon: Icons.print,
    path: "/admin/cetak",
  },
];

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role, userProfile }: SidebarProps & { userProfile: UserProfile }) {
  const isAdmin = role === "admin";
  const menu = isAdmin ? adminMenu : userMenu;
  const logoSrc = kemEntanLogo?.src || kemEntanLogo;
  const router = useRouter();

  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = userProfile.nama.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";

  // Tutup drawer otomatis tiap kali pindah halaman, biar tidak nyangkut terbuka
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between text-emerald-100 bg-gov-green">
      {/* Top section: Header & Logo */}
      <div>
        <div className="h-14 px-4 border-b border-emerald-900/60 flex items-center justify-between bg-gov-green">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Image
              src={logoSrc}
              alt="Logo Kementan"
              width={20}
              height={20}
              className="h-8 w-auto object-contain shrink-0 brightness-110 drop-shadow-xs"
            />
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-sm font-black tracking-tight text-white">
                  SMART
                </span>
                <span className="text-[11px] font-bold text-emerald-300">
                  BRMP SDLP
                </span>
              </div>
              <div className="text-[9.5px] text-emerald-200/80 leading-tight truncate">
                Kementerian Pertanian RI
              </div>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
            title="Tutup Menu"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={Icons.close} />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-0.5 overflow-y-auto">
          <div className="px-2.5 py-2 text-[9.5px] font-bold text-emerald-300/60 uppercase tracking-wider">
            Menu Utama
          </div>
          {menu.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-emerald-900/90 text-white font-bold border-l-3 border-emerald-400 shadow-xs"
                    : "text-emerald-100/80 hover:bg-emerald-800/50 hover:text-white"
                }`}
              >
                <span
                  className={`shrink-0 ${
                    isActive ? "text-emerald-300" : "text-emerald-300/70"
                  }`}
                >
                  <svg
                    width={15}
                    height={15}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.icon} />
                  </svg>
                </span>
                <span className="truncate text-[11.5px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Help & System Info */}
      <div className="p-3 border-t border-emerald-900/60 bg-gov-green-dark/50 space-y-2">
        <Link
          href="/tentang"
          className="flex w-full items-center justify-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs text-emerald-100/80 transition-all hover:bg-emerald-800/50 hover:text-white"
        >
          <span aria-hidden="true">ⓘ</span>
          Tentang Aplikasi
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-2 rounded-xl bg-emerald-950/40 p-2 text-left hover:bg-emerald-800/70">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">{initials}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">{userProfile.nama}</span><span className="block truncate text-[10px] text-emerald-200">{userProfile.email}</span></span><ChevronDown className="h-4 w-4 text-emerald-200" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-64 rounded-xl">
            <DropdownMenuItem onClick={() => setProfileOpen(true)}><User className="text-emerald-700" />Profil Saya</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}><LogOut />Keluar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <EditProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} userProfile={userProfile} onSave={() => router.refresh()} />
        <button
          onClick={() => {
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/");
                },
              },
            });
          }}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-950/40 hover:bg-rose-900/40 text-emerald-200 hover:text-rose-200 text-[11px] font-semibold transition cursor-pointer"
        >
          <svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d={Icons.logout} />
          </svg>
          Keluar Sistem
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar: hanya tampil di bawah breakpoint lg, tombol untuk buka drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-gov-green border-b border-emerald-900/60 flex items-center px-3 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-md text-emerald-100 hover:bg-emerald-800/50 transition cursor-pointer"
          title="Buka Menu"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-2.5 text-xs font-black tracking-tight text-white">
          SMART - BRMP SDLP
        </span>
      </div>

      {/* Desktop Sticky Sidebar — tampil mulai breakpoint lg (>=1024px) ke atas */}
      <aside className="hidden lg:block w-56 shrink-0 h-screen sticky top-0 border-r border-emerald-950/50 shadow-md z-20">
        {sidebarContent}
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-50 flex transition-opacity duration-200 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer content */}
        <div
          className={`relative w-64 max-w-[80vw] h-full shadow-2xl z-10 transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}

