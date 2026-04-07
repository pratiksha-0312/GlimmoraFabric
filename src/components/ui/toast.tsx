"use client";

import { toast as sonnerToast } from "sonner";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

/**
 * Toast notification store — wraps sonner with Glimmora-themed presets.
 *
 * Usage:
 *   import { toast } from "@/components/ui/toast";
 *   toast.success("Saved!");
 *   toast.error("Something went wrong");
 *   toast.warning("Careful!");
 *   toast.info("FYI — something happened");
 *   toast.promise(asyncFn(), { loading: "Saving...", success: "Done!", error: "Failed" });
 */

export const toast = {
  success(message: string, description?: string) {
    sonnerToast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    });
  },

  error(message: string, description?: string) {
    sonnerToast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    });
  },

  warning(message: string, description?: string) {
    sonnerToast.warning(message, {
      description,
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    });
  },

  info(message: string, description?: string) {
    sonnerToast.info(message, {
      description,
      icon: <Info className="h-4 w-4 text-blue-500" />,
    });
  },

  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) {
    return sonnerToast.promise(promise, messages);
  },

  dismiss(id?: string | number) {
    sonnerToast.dismiss(id);
  },
};
