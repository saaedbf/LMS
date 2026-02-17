import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "مدیریت مدارس",
  description: "سامانه مدیریت مدارس",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa/ir" dir="rtl">
      <body className="font-Iransans text-slate-800 bg-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
