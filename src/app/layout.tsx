import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Panglong | Sistem Informasi Toko Kayu",
    template: "%s | Panglong",
  },
  description:
    "Pencatatan stok, penjualan, pembelian, kontak, dan laporan untuk toko kayu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body
        className={`${bricolage.variable} ${manrope.variable} ${plexMono.variable} font-sans`}
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
