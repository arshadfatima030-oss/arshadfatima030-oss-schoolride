import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchoolRide",
  description: "School transport, attendance and fee management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
