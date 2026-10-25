import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowBoard — Project Management Workspace",
  description: "A modern project management workspace to organize tasks, track progress, and collaborate with your team.",
  keywords: ["project management", "kanban", "tasks", "team collaboration"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AppProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                fontSize: '14px',
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
