import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MBA Wizards | Mock Test & Exam Prep Portal",
  description:
    "Official-fidelity mock test & practice exam platform by MBA Wizards. Aspire. Advance. Achieve. Real 60-minute countdown, category weighting, and clinical skills practice.",
  keywords: ["MBA Wizards", "HOSA", "Surgical Technologist", "HCIE", "Healthcare Issues Exam", "Mock Test", "Practice Exam"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900"
      >
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

