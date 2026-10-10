"use client";

import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const config = {
  success: { variant: "success" as const, Icon: CheckCircle2 },
  error: { variant: "destructive" as const, Icon: XCircle },
  warning: { variant: "warning" as const, Icon: TriangleAlert },
  info: { variant: "info" as const, Icon: Info },
};

export function showToast(
  type: keyof typeof config,
  title: string,
  description?: string,
) {
  const { variant, Icon } = config[type];
  return toast.custom((id) => (
    <Alert variant={variant} className="w-[min(420px,calc(100vw-2rem))] rounded-xl px-4 py-3 shadow-xl">
      <Icon className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      <button
        type="button"
        aria-label="Tutup pemberitahuan"
        onClick={() => toast.dismiss(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-current/60 hover:bg-black/5 hover:text-current"
      >
        <X className="size-3.5" />
      </button>
    </Alert>
  ));
}
