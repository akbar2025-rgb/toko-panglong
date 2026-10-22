"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ToastProvider>{children}</ToastProvider>
    </StoreProvider>
  );
}
