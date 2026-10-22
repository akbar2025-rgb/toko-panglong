"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Dialog } from "@/components/dialog";

const navigation = [
  { href: "/", label: "Ringkasan", index: "01" },
  { href: "/inventaris", label: "Inventaris", index: "02" },
  { href: "/penjualan", label: "Penjualan", index: "03" },
  { href: "/pembelian", label: "Pembelian", index: "04" },
  { href: "/kontak", label: "Kontak", index: "05" },
  { href: "/laporan", label: "Laporan", index: "06" },
  { href: "/pengaturan", label: "Pengaturan", index: "07" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <p
        className={
          compact
            ? "font-heading text-lg font-bold tracking-[-0.04em] text-ink"
            : "font-heading text-2xl font-bold tracking-[-0.04em] text-surface"
        }
      >
        Panglong
      </p>
      <p
        className={
          compact
            ? "text-[0.68rem] font-medium text-muted"
            : "mt-0.5 text-xs font-medium text-sidebar-muted"
        }
      >
        Sistem informasi toko kayu
      </p>
    </div>
  );
}

function NavigationList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Navigasi utama" className="mt-7">
      <p className="mb-2 px-3 font-mono text-[0.65rem] text-sidebar-muted">
        Menu operasional
      </p>
      <ul className="space-y-1">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-clay text-surface"
                    : "text-sidebar-muted hover:bg-sidebar-soft hover:text-surface"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-[0.65rem] font-medium"
                >
                  {item.index}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { data } = useStore();

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="px-2">
        <Wordmark />
      </div>

      <Link
        href="/penjualan/baru"
        onClick={onNavigate}
        className="btn btn-primary mt-6 w-full"
      >
        Catat penjualan
      </Link>

      <NavigationList pathname={pathname} onNavigate={onNavigate} />

      <div className="mt-auto pt-8">
        <div className="rounded-xl border border-sidebar-line bg-sidebar-soft p-4">
          <p className="font-mono text-[0.65rem] font-medium text-sidebar-muted">
            Profil toko
          </p>
          <p className="mt-1.5 text-sm font-semibold text-surface">
            {data.settings.storeName}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-muted">
            Data contoh. Semua perubahan hanya tersimpan di browser ini.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-paper px-6"
    >
      <div className="w-full max-w-sm">
        <p className="font-heading text-3xl font-bold tracking-[-0.04em] text-ink">
          Panglong
        </p>
        <p className="mt-2 text-sm text-muted">Menyiapkan data toko...</p>
        <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-line">
          <div className="loading-bar h-full w-1/2 rounded-full bg-clay" />
        </div>
      </div>
    </main>
  );
}

function ErrorScreen({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6">
        <p className="font-mono text-[0.7rem] font-medium text-danger">
          Data lokal
        </p>
        <h1 className="mt-2 font-heading text-2xl font-semibold leading-tight text-ink">
          Data toko tidak dapat dibaca
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{message}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Muat ulang halaman untuk mencoba lagi, atau mulai dengan data contoh
          baru. Data contoh baru akan menggantikan data yang tidak terbaca.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-secondary w-full sm:w-auto"
          >
            Muat ulang halaman
          </button>
          <button
            type="button"
            onClick={onReset}
            className="btn btn-primary w-full sm:w-auto"
          >
            Gunakan data contoh
          </button>
        </div>
      </div>
    </main>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { status, loadError, storageWarning, resetData } = useStore();

  useEffect(() => {
    const active = navigation.find((item) =>
      isActivePath(pathname, item.href),
    );
    document.title = active
      ? `${active.label} | Panglong`
      : "Panglong | Sistem Informasi Toko Kayu";
  }, [pathname]);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "error") {
    return (
      <ErrorScreen
        message={
          loadError ??
          "Data yang tersimpan di browser tidak dapat dibuka saat ini."
        }
        onReset={resetData}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-paper">
      <a href="#konten" className="skip-link">
        Lewati ke konten
      </a>

      <aside
        aria-label="Informasi dan navigasi toko"
        className="on-dark fixed inset-y-0 left-0 z-30 hidden w-[264px] bg-sidebar lg:block"
      >
        <SidebarContent pathname={pathname} />
      </aside>

      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-line bg-paper px-4 lg:hidden">
        <Wordmark compact />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="btn btn-secondary"
        >
          <MenuIcon />
          Menu
        </button>
      </header>

      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Menu"
        variant="drawer"
        closeLabel="Tutup menu"
      >
        <SidebarContent
          pathname={pathname}
          onNavigate={() => setMenuOpen(false)}
        />
      </Dialog>

      <div className="lg:pl-[264px]">
        <main
          id="konten"
          className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 lg:px-10 lg:pb-20 lg:pt-10"
        >
          {storageWarning ? (
            <div
              role="status"
              className="mb-5 rounded-xl border border-amber/40 bg-amber-soft px-4 py-3 text-sm leading-relaxed text-ink"
            >
              {storageWarning}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
