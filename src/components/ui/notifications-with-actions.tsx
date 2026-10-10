"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ChevronRight, Loader2 } from "lucide-react";
import { markMyNotificationsRead } from "@/features/notifications/actions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  href?: string | null;
  read?: boolean;
  targetMenu?: string;
}

export default function NotificationsWithActions({
  items,
  onItemClick,
}: {
  items?: NotificationItem[];
  placement?: "top" | "right" | "bottom" | "left";
  onItemClick?: (item: NotificationItem) => void;
}) {
  const router = useRouter();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const notifications = (items ?? []).map((item) => ({
    ...item,
    read: item.read || readIds.has(item.id),
  }));

  const unread = notifications.filter((item) => !item.read).length;
  const markOneRead = (id: string) => {
    if (notifications.find((item) => item.id === id)?.read) return;
    setReadIds((current) => new Set(current).add(id));
    startTransition(async () => {
      await markMyNotificationsRead([id]);
    });
  };

  const markAllRead = () => {
    startTransition(async () => {
      await markMyNotificationsRead();
      setReadIds(new Set(notifications.map((item) => item.id)));
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="relative inline-flex items-center justify-center rounded-lg bg-emerald-800 p-2 text-white shadow-sm transition hover:bg-emerald-900 hover:text-white"
        title="Notifikasi Sistem"
      >
        <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-w-[17px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unread}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-80 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-emerald-900 bg-[#143D32] px-4 py-3 text-white">
          <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-emerald-300" /><h3 className="text-xs font-bold">Pemberitahuan Sistem</h3></div>
          <button type="button" onClick={markAllRead} disabled={pending || unread === 0} className="inline-flex items-center gap-1 rounded bg-emerald-800/80 px-2 py-1 text-[10px] font-semibold text-emerald-100 disabled:opacity-50"><Check className="h-3 w-3" /> Tandai dibaca</button>
        </div>
        {pending && <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-[11px] text-slate-500"><Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...</div>}
        {notifications.length === 0 ? <div className="px-4 py-10 text-center text-xs text-slate-500">Tidak ada pemberitahuan baru</div> : <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">{notifications.map((item) => <li key={item.id}><button type="button" className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${item.read ? "" : "bg-emerald-50/50"}`} onClick={() => { markOneRead(item.id); onItemClick?.(item); if (item.href) router.push(item.href); setOpen(false); }}><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-slate-200" : "bg-rose-500"}`} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-xs text-slate-900">{item.title}</strong><span className="whitespace-nowrap text-[10px] text-slate-400">{new Date(item.time).toLocaleDateString("id-ID")}</span></span><span className="mt-0.5 block text-[11px] leading-snug text-slate-600">{item.description}</span></span><ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" /></button></li>)}</ul>}
      </PopoverContent>
    </Popover>
  );
}
